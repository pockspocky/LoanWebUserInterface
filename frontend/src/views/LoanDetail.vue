<template>
  <div class="loan-detail">
    <n-card class="detail-card">
      <div class="card-header">
        <n-space align="center">
          <n-icon size="20">
            <cash-outline />
          </n-icon>
          <h2 class="title">贷款详情</h2>
        </n-space>
      </div>

      <div v-if="loading" class="loading-container">
        <n-spin size="large" description="加载中..." />
      </div>

      <n-result
        v-else-if="error"
        status="error"
        :title="error"
        :description="errorDescription"
      >
        <template #footer>
          <n-space>
            <n-button @click="fetchLoanDetail" type="primary">
              <template #icon>
                <n-icon><refresh-outline /></n-icon>
              </template>
              重试
            </n-button>
            <n-button @click="goBack">
              <template #icon>
                <n-icon><arrow-back-outline /></n-icon>
              </template>
              返回
            </n-button>
          </n-space>
        </template>
      </n-result>

      <template v-else>
        <n-grid :cols="24" :x-gap="24">
          <n-grid-item :span="24">
            <n-card title="基本信息" class="info-card">
              <n-descriptions :column="3" bordered>
                <n-descriptions-item label="贷款名称">
                  {{ loan.name }}
                </n-descriptions-item>
                <n-descriptions-item label="贷款金额">
                  <n-text type="success">¥{{ formatAmount(loan.amount) }}</n-text>
                </n-descriptions-item>
                <n-descriptions-item label="月利率">
                  <n-text type="info">{{ formatRate(loan.monthlyInterestRate) }}%</n-text>
                </n-descriptions-item>
              </n-descriptions>
            </n-card>
          </n-grid-item>

          <n-grid-item :span="12">
            <n-card title="还款信息" class="info-card">
              <n-descriptions :column="1" bordered>
                <n-descriptions-item label="贷款期限">
                  {{ loan.term }}个月
                </n-descriptions-item>
                <n-descriptions-item label="总还款金额">
                  <n-text type="warning">¥{{ formatAmount(loan.totalRepayment) }}</n-text>
                </n-descriptions-item>
                <n-descriptions-item label="月还款金额">
                  <n-text type="info">¥{{ formatAmount(loan.monthlyRepayment) }}</n-text>
                </n-descriptions-item>
                <n-descriptions-item label="已还金额">
                  <n-text type="success">¥{{ formatAmount(loan.repaidAmount) }}</n-text>
                </n-descriptions-item>
              </n-descriptions>
            </n-card>
          </n-grid-item>

          <n-grid-item :span="12">
            <n-card title="贷款属性" class="info-card">
              <n-descriptions :column="1" bordered>
                <n-descriptions-item label="贷款类型">
                  <n-tag :bordered="false" type="success">
                    {{ getLoanType(loan.type) }}
                  </n-tag>
                </n-descriptions-item>
                <n-descriptions-item label="银行">
                  <n-tag :bordered="false" type="info">
                    {{ getBank(loan.bank) }}
                  </n-tag>
                </n-descriptions-item>
                <n-descriptions-item label="还款方式">
                  <n-tag :bordered="false" type="warning">
                    {{ getRepaymentMethod(loan.repaymentMethod) }}
                  </n-tag>
                </n-descriptions-item>
                <n-descriptions-item label="贷款状态">
                  <n-tag :bordered="false" :type="getStatusType(loan.status)">
                    {{ getStatus(loan.status) }}
                  </n-tag>
                </n-descriptions-item>
              </n-descriptions>
            </n-card>
          </n-grid-item>

          <n-grid-item :span="24">
            <n-card title="时间信息" class="info-card">
              <n-timeline>
                <n-timeline-item type="success" :title="formatDate(loan.createdAt)">
                  贷款创建
                </n-timeline-item>
                <n-timeline-item 
                  :type="loan.status === 'completed' ? 'success' : 'warning'"
                  :title="formatDate(loan.updatedAt)"
                >
                  {{ getStatus(loan.status) }}
                </n-timeline-item>
              </n-timeline>
            </n-card>
          </n-grid-item>

          <n-grid-item :span="24">
            <n-card title="还款记录" class="info-card">
              <template #header-extra>
                <n-button 
                  type="primary"
                  @click="showBatchPaymentDialog = true"
                  :disabled="remainingAmount <= 0"
                >
                  批量还款
                </n-button>
              </template>
              <n-data-table
                :columns="paymentColumns"
                :data="record.payments"
                :pagination="{ pageSize: 12 }"
                :bordered="true"
                :single-line="false"
              />
            </n-card>
          </n-grid-item>
        </n-grid>

        <div class="footer-actions">
          <n-space>
            <n-button @click="goBack">
              <template #icon>
                <n-icon><arrow-back-outline /></n-icon>
              </template>
              返回
            </n-button>
          </n-space>
        </div>
      </template>
    </n-card>

    <!-- 更新金额对话框 -->
    <n-modal v-model:show="showAmountDialog" preset="dialog" title="更新已还金额">
      <n-form>
        <n-form-item label="已还金额">
          <n-input-number
            v-model:value="updateAmount"
            :min="0"
            :max="loan.monthlyRepayment"
            :precision="2"
            style="width: 100%"
          />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space justify="end">
          <n-button @click="showAmountDialog = false">取消</n-button>
          <n-button type="primary" @click="handleUpdateAmount">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 批量还款对话框 -->
    <n-modal v-model:show="showBatchPaymentDialog" preset="dialog" title="批量还款">
      <n-form>
        <n-form-item label="剩余应还">
          <n-text type="info">¥{{ formatAmount(remainingAmount) }}</n-text>
        </n-form-item>
        <n-form-item label="剩余期数">
          <n-text type="info">{{ remainingMonths }}期</n-text>
        </n-form-item>
        <n-form-item label="还款金额">
          <n-input-number
            v-model:value="batchPaymentAmount"
            :min="0"
            :max="remainingAmount"
            :precision="2"
            :formatter="formatAmount"
            :parser="parseAmount"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item label="预计还款期数">
          <n-text>{{ calculatePaymentMonths() }}</n-text>
        </n-form-item>
      </n-form>
      <template #action>
        <n-space justify="end">
          <n-button @click="showBatchPaymentDialog = false">取消</n-button>
          <n-button 
            type="primary" 
            @click="handleBatchPayment"
            :loading="batchPaymentLoading"
            :disabled="batchPaymentAmount <= 0"
          >
            确定
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Loan, LoanType, BankType, RepaymentMethodType, LoanStatus, LoanRecord, Payment, PaymentStatus } from '../types/loan'
import { paymentStatusOptions, paymentStatusTypes } from '../types/loan'
import { getLoanById, updatePayment, updatePaymentBatch } from '../api/loans'
import { 
  CashOutline,
  RefreshOutline,
  ArrowBackOutline
} from '@vicons/ionicons5'
import type { DataTableColumns } from 'naive-ui'
import { NTag, NButton, NSpace } from 'naive-ui'

const route = useRoute()
const router = useRouter()
const loan = ref<Loan>({} as Loan)
const record = ref<LoanRecord>({} as LoanRecord)
const loading = ref(false)
const error = ref('')
const errorDescription = ref('')

const loanTypes: Record<LoanType, string> = {
  house: '房贷',
  car: '车贷',
  consumer: '消费贷',
  business: '经营贷',
  other: '其他'
}

const banks: Record<BankType, string> = {
  ICBC: '工商银行',
  CCB: '建设银行',
  ABC: '农业银行',
  BOC: '中国银行',
  BOCOM: '交通银行',
  other: '其他'
}

const repaymentMethods: Record<RepaymentMethodType, string> = {
  equalPayment: '等额本息',
  equalPrincipal: '等额本金',
  interestFirst: '先息后本',
  bulletPayment: '到期还本付息',
  other: '其他'
}

const statuses: Record<LoanStatus, string> = {
  processing: '处理中',
  completed: '已完成'
}

const statusTypes: Record<LoanStatus, 'warning' | 'success' | 'error' | 'default'> = {
  processing: 'warning',
  completed: 'success'
}

const getLoanType = (type: LoanType) => {
  return loanTypes[type] || type
}

const getBank = (bank: BankType) => {
  return banks[bank] || bank
}

const getRepaymentMethod = (method: RepaymentMethodType) => {
  return repaymentMethods[method] || method
}

const getStatus = (status: LoanStatus) => {
  return statuses[status] || status
}

const getStatusType = (status: LoanStatus) => {
  return statusTypes[status] || 'default'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

const formatRate = (rate: number) => {
  return (rate * 100).toFixed(2)
}

const getPaymentStatusLabel = (status: PaymentStatus) => {
  return paymentStatusOptions.find(option => option.value === status)?.label || status
}

const handleUpdatePayment = async (month: number, status: PaymentStatus, paidAmount?: number) => {
  try {
    await updatePayment(loan.value._id, month, { status, paidAmount })
    await fetchLoanDetail()
  } catch (err: any) {
    console.error('更新还款记录失败:', err)
  }
}

const showAmountDialog = ref(false)
const selectedPayment = ref<Payment | null>(null)
const updateAmount = ref(0)

const showUpdateAmountDialog = (payment: Payment) => {
  selectedPayment.value = payment
  updateAmount.value = payment.paidAmount
  showAmountDialog.value = true
}

const handleUpdateAmount = async () => {
  if (!selectedPayment.value) return
  
  try {
    await updatePayment(
      loan.value._id, 
      selectedPayment.value.month, 
      { 
        paidAmount: updateAmount.value,
        status: updateAmount.value >= loan.value.monthlyRepayment ? 'paid' : 'pending'
      }
    )
    showAmountDialog.value = false
    await fetchLoanDetail()
  } catch (err: any) {
    console.error('更新还款金额失败:', err)
  }
}

const paymentColumns: DataTableColumns<Payment> = [
  {
    title: '期数',
    key: 'month',
    align: 'center',
    render: (row) => `第${row.month}期`
  },
  {
    title: '应还金额',
    key: 'monthlyRepayment',
    align: 'right',
    render: () => formatAmount(loan.value.monthlyRepayment)
  },
  {
    title: '已还金额',
    key: 'paidAmount',
    align: 'right',
    render: (row) => formatAmount(row.paidAmount)
  },
  {
    title: '状态',
    key: 'status',
    align: 'center',
    render: (row) => h(
      NTag,
      {
        type: paymentStatusTypes[row.status],
        bordered: false
      },
      { default: () => getPaymentStatusLabel(row.status) }
    )
  },
  {
    title: '操作',
    key: 'actions',
    align: 'center',
    render: (row) => {
      if (row.status === 'paid') {
        return null
      }
      return h(
        NSpace,
        { justify: 'center' },
        {
          default: () => [
            h(
              NButton,
              {
                type: 'primary',
                size: 'small',
                onClick: () => handleUpdatePayment(row.month, 'paid', loan.value.monthlyRepayment)
              },
              { default: () => '标记为已还' }
            ),
            h(
              NButton,
              {
                type: 'info',
                size: 'small',
                onClick: () => showUpdateAmountDialog(row)
              },
              { default: () => '更新金额' }
            )
          ]
        }
      )
    }
  }
]

const goBack = () => {
  router.back()
}

const fetchLoanDetail = async () => {
      const id = route.params.id as string
      loading.value = true
      error.value = ''
      errorDescription.value = ''
      
      try {
        const response = await getLoanById(id)
        loan.value = response.data.loan
        record.value = response.data.record
      } catch (err: any) {
        error.value = '获取贷款详情失败'
        errorDescription.value = err.message || '请稍后重试'
    console.error('获取贷款详情失败:', err)
  } finally {
    loading.value = false
  }
}

// 批量还款相关
const showBatchPaymentDialog = ref(false)
const batchPaymentAmount = ref(0)
const batchPaymentLoading = ref(false)

// 计算剩余应还金额
const remainingAmount = computed(() => {
  const totalAmount = loan.value.totalRepayment
  const repaidAmount = loan.value.repaidAmount
  return Math.max(0, totalAmount - repaidAmount)
})

// 计算剩余期数
const remainingMonths = computed(() => {
  if (!record.value?.payments) return 0
  return record.value.payments.filter(p => p.status !== 'paid').length
})

// 金额处理工具
const moneyUtils = {
  // 格式化显示金额（用于展示）
  format: (value: number | string | null | undefined): string => {
    if (!value && value !== 0) return ''
    const num = typeof value === 'string' ? Number(value) : value || 0
    return num.toFixed(2)
  },
  
  // 解析输入的金额（用于处理用户输入）
  parse: (value: string | null | undefined): number => {
    if (!value) return 0
    // 移除所有非数字和小数点
    const cleanValue = value.replace(/[^\d.]/g, '')
    // 确保只有一个小数点
    const parts = cleanValue.split('.')
    const intPart = parts[0]
    const decPart = parts[1] ? parts[1].slice(0, 2) : '00'
    return Number(`${intPart}.${decPart}`)
  },
  
  // 规范化金额（用于计算和提交）
  normalize: (value: number): number => {
    return Number(Number(value).toFixed(2))
  },

  // 金额比较（考虑精度误差）
  isEqual: (a: number, b: number): boolean => {
    return Math.abs(a - b) < 0.01
  },

  // 金额是否大于等于（考虑精度误差）
  isGreaterOrEqual: (a: number, b: number): boolean => {
    return a - b > -0.01
  },

  // 加法
  add: (a: number, b: number): number => {
    return Number((a + b).toFixed(2))
  },

  // 减法
  subtract: (a: number, b: number): number => {
    return Number((a - b).toFixed(2))
  },

  // 乘法
  multiply: (a: number, b: number): number => {
    return Number((a * b).toFixed(2))
  },

  // 除法
  divide: (a: number, b: number): number => {
    return Number((a / b).toFixed(2))
  }
}

// 格式化和解析函数（用于模板中的简化引用）
const formatAmount = moneyUtils.format
const parseAmount = moneyUtils.parse

// 处理批量还款
const handleBatchPayment = async () => {
  if (!batchPaymentAmount.value || batchPaymentAmount.value <= 0) return

  try {
    batchPaymentLoading.value = true
    let remainingAmount = moneyUtils.normalize(batchPaymentAmount.value)
    const monthlyPayment = loan.value.monthlyRepayment
    const payments: Array<{ month: number, paidAmount: number, status: 'paid' | 'pending' | 'overdue' }> = []

    // 找到未还清的月份
    const unpaidMonths = record.value.payments
      .map((p, index) => ({ ...p, index: index + 1 }))
      .filter(p => p.status !== 'paid')
      .map(p => ({ month: p.index, currentPaid: moneyUtils.normalize(p.paidAmount) }))

    if (unpaidMonths.length === 0) return

    // 计算每期还款
    for (let i = 0; i < unpaidMonths.length && remainingAmount > 0; i++) {
      const { month, currentPaid } = unpaidMonths[i]
      const isLastUnpaidMonth = i === unpaidMonths.length - 1
      let newPayment: number

      if (isLastUnpaidMonth) {
        // 最后一期，把所有剩余金额都加到已有金额上
        newPayment = remainingAmount
      } else {
        // 非最后一期，按月还款额计算
        const maxPayment = moneyUtils.subtract(monthlyPayment, currentPaid)
        newPayment = moneyUtils.normalize(Math.min(remainingAmount, maxPayment))
      }

      const totalPaidAmount = moneyUtils.add(currentPaid, newPayment)
      
      payments.push({
        month,
        paidAmount: totalPaidAmount,
        status: moneyUtils.isGreaterOrEqual(totalPaidAmount, monthlyPayment) ? 'paid' : 'pending'
      })

      remainingAmount = moneyUtils.subtract(remainingAmount, newPayment)
    }

    // 调用批量更新接口
    await updatePaymentBatch(loan.value._id, payments)
    showBatchPaymentDialog.value = false
    batchPaymentAmount.value = 0
    await fetchLoanDetail()
  } catch (err: any) {
    console.error('批量还款失败:', err)
  } finally {
    batchPaymentLoading.value = false
  }
}

// 计算可以还多少期
const calculatePaymentMonths = () => {
  if (!batchPaymentAmount.value || !loan.value.monthlyRepayment) {
    return '暂无可还期数'
  }

  const amount = moneyUtils.normalize(batchPaymentAmount.value)
  const monthlyPayment = loan.value.monthlyRepayment
  const fullMonths = Math.floor(amount / monthlyPayment)
  const remainingAmount = moneyUtils.subtract(amount, moneyUtils.multiply(fullMonths, monthlyPayment))

  if (fullMonths === 0) {
    if (remainingAmount > 0) {
      return `金额不足一期，将计入第一个未还期数`
    }
    return '金额不足一期还款'
  }

  let result = `可还${fullMonths}期`
  if (remainingAmount > 0.01) {
    result += `，剩余${formatAmount(remainingAmount)}元将计入最后一期`
  }
  return result
}

onMounted(fetchLoanDetail)
</script>

<style scoped>
.loan-detail {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.detail-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 8px 0;
}

.title {
  margin: 0;
  font-size: 18px;
  color: #2d3436;
}

.info-card {
  height: 100%;
  border-radius: 8px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
</style> 