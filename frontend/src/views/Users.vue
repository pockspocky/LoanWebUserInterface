<template>
  <div class="users-container">
    <div class="header">
      <h2>用户管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        <el-button @click="router.push('/')">返回仪表盘</el-button>
      </div>
    </div>

    <div class="users-content">
      <el-table :data="users" style="width: 100%" v-loading="loading">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="isAdmin" label="角色">
          <template #default="scope">
            {{ scope.row.isAdmin ? '管理员' : '普通用户' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button 
              type="primary"
              size="small"
              @click="handleViewLoans(scope.row)"
            >
              查看贷款
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="handleDeleteUser(scope.row)"
              :disabled="scope.row.username === 'admin'"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加用户对话框 -->
    <el-dialog v-model="dialogVisible" title="添加用户" width="30%">
      <el-form :model="newUser" :rules="rules" ref="formRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="newUser.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="newUser.password" type="password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddUser" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 用户贷款对话框 -->
    <el-dialog 
      v-model="loansDialogVisible" 
      :title="currentUser ? `${currentUser.username} 的贷款` : '贷款列表'"
      width="90%"
    >
      <div class="loans-table-container">
        <el-table 
          :data="currentUserLoans" 
          style="width: 150%" 
          v-loading="loansLoading"
        >
          <el-table-column prop="name" label="贷款名称" min-width="120" />
          <el-table-column prop="amount" label="贷款金额" min-width="150">
            <template #default="{ row }">
              {{ formatMoney(row.amount) }}
            </template>
          </el-table-column>
          <el-table-column prop="monthlyInterestRate" label="月利率" min-width="100">
            <template #default="{ row }">
              {{ formatInterestRate(row.monthlyInterestRate) }}
            </template>
          </el-table-column>
          <el-table-column prop="term" label="期限" min-width="80">
            <template #default="{ row }">
              {{ row.term }}月
            </template>
          </el-table-column>
          <el-table-column prop="monthlyRepayment" label="月还款" min-width="120">
            <template #default="{ row }">
              {{ formatMoney(row.monthlyRepayment) }}
            </template>
          </el-table-column>
          <el-table-column prop="totalRepayment" label="总还款" min-width="150">
            <template #default="{ row }">
              {{ formatMoney(row.totalRepayment) }}
            </template>
          </el-table-column>
          <el-table-column prop="repaidAmount" label="已还金额" min-width="120">
            <template #default="{ row }">
              {{ formatMoney(row.repaidAmount) }}
            </template>
          </el-table-column>
          <el-table-column prop="type" label="贷款类型" min-width="100">
            <template #default="{ row }">
              {{ row.type === 'other' ? row.customType : getLoanTypeLabel(row.type) }}
            </template>
          </el-table-column>
          <el-table-column prop="bank" label="贷款银行" min-width="100">
            <template #default="{ row }">
              {{ row.bank === 'other' ? row.customBank : getBankLabel(row.bank) }}
            </template>
          </el-table-column>
          <el-table-column prop="repaymentMethod" label="还款方式" min-width="140">
            <template #default="{ row }">
              {{ row.repaymentMethod === 'other' ? row.customRepaymentMethod : getRepaymentMethodLabel(row.repaymentMethod) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" min-width="100">
            <template #default="{ row }">
              <el-tag :type="getLoanStatusType(row.status)">
                {{ getLoanStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { userApi, loanApi } from '../api'
import type { User } from '../types/auth'
import type { Loan } from '../types/loan'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  loanTypeOptions,
  bankOptions,
  repaymentMethodOptions,
  loanStatusOptions
} from '../types/loan'

const router = useRouter()
const userStore = useUserStore()

// 如果不是管理员，重定向到仪表盘
if (!userStore.isAdmin) {
  router.push('/dashboard')
}

const users = ref<User[]>([])
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const formRef = ref()

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const newUser = ref({
  username: '',
  password: '',
  isAdmin: false
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadUsers = async () => {
  loading.value = true
  try {
    const response = await userApi.getUsers()
    if (response.code === 200) {
      users.value = response.data
    }
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleAddUser = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitting.value = true
      try {
        const response = await userApi.addUser(newUser.value)
        if (response.code === 200) {
          ElMessage.success('添加用户成功')
          dialogVisible.value = false
          loadUsers()
          newUser.value = {
            username: '',
            password: '',
            isAdmin: false
          }
        }
      } catch (error) {
        ElMessage.error('添加用户失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleDeleteUser = async (user: User) => {
  if (user.username === 'admin') {
    ElMessage.error('不能删除管理员账号')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除用户 ${user.username} 吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await userApi.deleteUser(user._id)
    if (response.code === 200) {
      ElMessage.success('删除成功')
      loadUsers()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 用户贷款对话框
const loansDialogVisible = ref(false)
const currentUserLoans = ref<Loan[]>([])
const currentUser = ref<User | null>(null)
const loansLoading = ref(false)

// 查看用户贷款
const handleViewLoans = async (user: User) => {
  currentUser.value = user
  loansDialogVisible.value = true
  loansLoading.value = true
  try {
    const response = await loanApi.getAllLoans()
    if (response.code === 200) {
      // 过滤出当前用户的贷款
      currentUserLoans.value = response.data.filter(
        (loan: Loan) => {
          const loanUserId = typeof loan.userId === 'string' ? loan.userId : loan.userId._id
          return loanUserId === user._id
        }
      )
    }
  } catch (error) {
    ElMessage.error('获取贷款列表失败')
  } finally {
    loansLoading.value = false
  }
}

// 格式化金额
const formatMoney = (amount: number) => {
  return `¥${amount.toLocaleString()}`
}

// 格式化利率
const formatInterestRate = (rate: number) => {
  return `${(rate * 100).toFixed(2)}%`
}

// 获取标签文本
const getLoanTypeLabel = (type: string) => {
  return loanTypeOptions.find(option => option.value === type)?.label || type
}

const getBankLabel = (bank: string) => {
  return bankOptions.find(option => option.value === bank)?.label || bank
}

const getRepaymentMethodLabel = (method: string) => {
  return repaymentMethodOptions.find(option => option.value === method)?.label || method
}

const getLoanStatusLabel = (status: string) => {
  return loanStatusOptions.find(option => option.value === status)?.label || status
}

// 获取状态标签类型
const getLoanStatusType = (status: string): 'success' | 'warning' | 'info' | 'danger' => {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'approved':
      return 'success'
    case 'rejected':
      return 'danger'
    case 'cancelled':
      return 'info'
    default:
      return 'info'
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.users-container {
  padding: 20px;
  height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.users-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
  overflow-x: auto;
}

.loans-table-container {
  overflow-x: auto;
  padding-bottom: 8px;
}
</style> 