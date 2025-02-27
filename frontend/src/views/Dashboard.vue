<template>
  <div class="dashboard-container">
    <div class="header">
      <h2>仪表盘</h2>
      <div class="header-actions">
        <el-button 
          v-if="userStore.isAdmin" 
          type="primary" 
          @click="router.push('/users')"
        >
          用户管理
        </el-button>
        <el-button type="danger" @click="handleLogout">退出登录</el-button>
      </div>
    </div>
    <div class="dashboard-content">
      <el-card class="welcome-card">
        <template #header>
          <div class="card-header">
            <span>欢迎回来，{{ username }}</span>
          </div>
        </template>
        <div class="card-content">
          <p>账户类型：{{ userStore.isAdmin ? '管理员' : '普通用户' }}</p>
        </div>
      </el-card>

      <el-card class="loan-card">
        <template #header>
          <div class="card-header">
            <div class="filter-group">
              <el-radio-group v-model="statusFilter" @change="handleStatusFilterChange">
                <el-radio-button label="">全部</el-radio-button>
                <el-radio-button 
                  v-for="option in loanStatusOptions" 
                  :key="option.value" 
                  :label="option.value"
                >
                  {{ option.label }}
                </el-radio-button>
              </el-radio-group>
            </div>
            <el-button type="primary" size="small" @click="showLoanForm = true">
              新增贷款
            </el-button>
          </div>
        </template>
        <div class="card-content">
          <div class="table-container">
            <el-table 
              :data="loans" 
              style="width: 150%" 
              v-loading="loading"
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
              <el-table-column label="操作" min-width="100" fixed="right">
                <template #default="{ row }">
                  <el-dropdown trigger="click">
                    <el-button type="primary" size="small">
                      操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="handleViewDetails(row)">
                          <el-icon><view /></el-icon>查看详情
                        </el-dropdown-item>
                        <el-dropdown-item
                          v-if="row.status === 'processing'"
                          @click="handleComplete(row)"
                          divided
                          type="success"
                        >
                          <el-icon><check /></el-icon>完成贷款
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div v-if="!loading && !loans.length" class="empty-text">
            暂无贷款记录
          </div>
        </div>
      </el-card>
    </div>

    <!-- 新增贷款表单 -->
    <loan-form
      v-model="showLoanForm"
      @submit-success="handleLoanSubmitSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, View, Check } from '@element-plus/icons-vue'
import { loanApi } from '../api'
import type { Loan, LoanType, BankType, RepaymentMethodType, LoanStatus } from '../types/loan'
import {
  loanTypeOptions,
  bankOptions,
  repaymentMethodOptions,
  loanStatusOptions
} from '../types/loan'
import LoanForm from '../components/LoanForm.vue'

const userStore = useUserStore()
const router = useRouter()
const loading = ref(false)
const statusFilter = ref('')
const allLoans = ref<Loan[]>([])
const loans = computed(() => {
  if (!statusFilter.value) {
    return allLoans.value
  }
  return allLoans.value.filter(loan => loan.status === statusFilter.value)
})
const showLoanForm = ref(false)

// 获取用户名
const username = computed(() => userStore.user?.username || '用户')

// 格式化金额
const formatMoney = (amount: number) => {
  return `¥${amount.toLocaleString()}`
}

// 获取标签文本
const getLoanTypeLabel = (type: LoanType) => {
  return loanTypeOptions.find(option => option.value === type)?.label || type
}

const getBankLabel = (bank: BankType) => {
  return bankOptions.find(option => option.value === bank)?.label || bank
}

const getRepaymentMethodLabel = (method: RepaymentMethodType) => {
  return repaymentMethodOptions.find(option => option.value === method)?.label || method
}

const getLoanStatusLabel = (status: LoanStatus) => {
  return loanStatusOptions.find(option => option.value === status)?.label || status
}

// 获取状态标签类型
const getLoanStatusType = (status: LoanStatus): 'success' | 'warning' | 'info' | 'danger' => {
  switch (status) {
    case 'processing':
      return 'warning'
    case 'completed':
      return 'success'
    default:
      return 'info'
  }
}

// 格式化利率
const formatInterestRate = (rate: number) => {
  return `${(rate * 100).toFixed(2)}%`
}

// 处理状态筛选变化
const handleStatusFilterChange = () => {
  // 状态改变时不需要重新加载数据，直接使用计算属性过滤
}

// 加载贷款列表
const loadLoans = async () => {
  try {
    loading.value = true
    const response = await loanApi.getMyLoans()
    console.log('API Response:', response)
    if (response.code === 200) {
      console.log('Response data:', response.data)
      allLoans.value = response.data || []
    } else {
      allLoans.value = []
      ElMessage.error(response.message || '加载贷款列表失败')
    }
  } catch (error) {
    console.error('Load loans failed:', error)
    ElMessage.error('加载贷款列表失败')
    allLoans.value = []
  } finally {
    loading.value = false
  }
}

// 处理查看详情
const handleViewDetails = (loan: Loan) => {
  router.push(`/loans/${loan._id}`)
}

// 完成贷款
const handleComplete = async (loan: Loan) => {
  try {
    await ElMessageBox.confirm('确定要将该贷款标记为已完成吗？', '提示', {
      type: 'warning'
    })
    
    const response = await loanApi.completeLoan(loan._id)
    if (response.code === 200) {
      ElMessage.success('操作成功')
      loadLoans()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Complete loan failed:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 退出登录
const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

// 提交成功处理
const handleLoanSubmitSuccess = () => {
  loadLoans()
}

onMounted(() => {
  loadLoans()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
}

.dashboard-content {
  display: grid;
  gap: 20px;
}

.welcome-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-group {
  display: flex;
  gap: 16px;
  align-items: center;
}

.card-content {
  overflow-x: auto;
}

.table-container {
  min-width: 100%;
  padding-bottom: 8px;
}

.empty-text {
  text-align: center;
  color: #909399;
  padding: 20px;
}
</style> 