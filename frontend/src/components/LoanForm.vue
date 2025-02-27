<template>
  <el-dialog
    v-model="dialogVisible"
    title="新增贷款"
    width="500px"
  >
    <el-form 
      :model="form" 
      :rules="rules"
      ref="formRef"
      label-width="120px"
    >
      <el-form-item label="贷款名称" prop="name">
        <el-input 
          v-model="form.name" 
          placeholder="请输入贷款名称"
        />
      </el-form-item>

      <el-form-item label="贷款金额" prop="amount">
        <el-input-number 
          v-model="form.amount" 
          :min="1000"
          :step="1000"
          controls-position="right"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="月利率" prop="monthlyInterestRate">
        <el-input-number 
          v-model="form.displayRate" 
          :min="0"
          :max="100"
          :precision="2"
          :step="0.01"
          controls-position="right"
          style="width: 100%"
          @update:model-value="handleRateChange"
        >
          <template #suffix>%</template>
        </el-input-number>
      </el-form-item>

      <el-form-item label="贷款期限" prop="term">
        <el-input-number 
          v-model="form.term" 
          :min="1"
          :max="360"
          :step="1"
          controls-position="right"
          style="width: 100%"
        >
          <template #suffix>月</template>
        </el-input-number>
      </el-form-item>

      <el-form-item label="贷款类型" prop="type">
        <el-select 
          v-model="form.type" 
          placeholder="请选择贷款类型"
          @change="handleTypeChange"
          style="width: 100%"
        >
          <el-option 
            v-for="option in loanTypeOptions" 
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item 
        v-if="showCustomType"
        label="自定义类型"
        prop="customType"
      >
        <el-input 
          v-model="form.customType"
          placeholder="请输入自定义贷款类型"
        />
      </el-form-item>

      <el-form-item label="贷款银行" prop="bank">
        <el-select 
          v-model="form.bank" 
          placeholder="请选择贷款银行"
          @change="handleBankChange"
          style="width: 100%"
        >
          <el-option 
            v-for="option in bankOptions" 
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item 
        v-if="showCustomBank"
        label="自定义银行"
        prop="customBank"
      >
        <el-input 
          v-model="form.customBank"
          placeholder="请输入自定义银行名称"
        />
      </el-form-item>

      <el-form-item label="还款方式" prop="repaymentMethod">
        <el-select 
          v-model="form.repaymentMethod" 
          placeholder="请选择还款方式"
          @change="handleRepaymentMethodChange"
          style="width: 100%"
        >
          <el-option 
            v-for="option in repaymentMethodOptions" 
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item 
        v-if="showCustomRepaymentMethod"
        label="自定义还款"
        prop="customRepaymentMethod"
      >
        <el-input 
          v-model="form.customRepaymentMethod"
          placeholder="请输入自定义还款方式"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          提交
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { loanTypeOptions, bankOptions, repaymentMethodOptions } from '../types/loan'
import type { LoanRequest, LoanType, BankType, RepaymentMethodType } from '../types/loan'
import { loanApi } from '../api'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit-success'): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref<FormInstance>()
const submitting = ref(false)

interface LoanFormData extends LoanRequest {
  displayRate: number
}

const initialForm: LoanRequest = {
  name: '',
  amount: 1000,
  monthlyInterestRate: 0.001, // 默认0.1%
  term: 12, // 默认12个月
  type: 'consumer' as LoanType,
  bank: 'ICBC' as BankType,
  repaymentMethod: 'equalPayment' as RepaymentMethodType,
  customType: '',
  customBank: '',
  customRepaymentMethod: ''
}

const form = reactive<LoanFormData>({
  ...initialForm,
  displayRate: initialForm.monthlyInterestRate * 100 // 显示用的百分比利率
})

const showCustomType = computed(() => form.type === 'other')
const showCustomBank = computed(() => form.bank === 'other')
const showCustomRepaymentMethod = computed(() => form.repaymentMethod === 'other')

const rules: FormRules = {
  name: [
    { required: true, message: '请输入贷款名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  amount: [
    { required: true, message: '请输入贷款金额', trigger: 'blur' },
    { type: 'number', min: 1000, message: '贷款金额不能小于1000', trigger: 'blur' }
  ],
  monthlyInterestRate: [
    { required: true, message: '请输入月利率', trigger: 'blur' },
    { 
      validator: (rule: any, value: number, callback: any) => {
        const rate = form.displayRate
        if (rate < 0 || rate > 100) {
          callback(new Error('月利率必须在0-100%之间'))
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change']
    }
  ],
  term: [
    { required: true, message: '请输入贷款期限', trigger: 'blur' },
    { type: 'number', min: 1, max: 360, message: '贷款期限必须在1-360个月之间', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择贷款类型', trigger: 'change' }
  ],
  bank: [
    { required: true, message: '请选择贷款银行', trigger: 'change' }
  ],
  repaymentMethod: [
    { required: true, message: '请选择还款方式', trigger: 'change' }
  ],
  customType: [
    { 
      validator: (rule: any, value: string, callback: any) => {
        if (showCustomType.value && !value) {
          callback(new Error('请输入自定义贷款类型'))
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change']
    }
  ],
  customBank: [
    { 
      validator: (rule: any, value: string, callback: any) => {
        if (showCustomBank.value && !value) {
          callback(new Error('请输入自定义银行名称'))
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change']
    }
  ],
  customRepaymentMethod: [
    { 
      validator: (rule: any, value: string, callback: any) => {
        if (showCustomRepaymentMethod.value && !value) {
          callback(new Error('请输入自定义还款方式'))
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change']
    }
  ]
}

const handleRateChange = (value: number | undefined) => {
  if (typeof value === 'number') {
    form.monthlyInterestRate = value / 100
  }
}

const handleTypeChange = (value: LoanType) => {
  if (value !== 'other') {
    form.customType = ''
  }
}

const handleBankChange = (value: BankType) => {
  if (value !== 'other') {
    form.customBank = ''
  }
}

const handleRepaymentMethodChange = (value: RepaymentMethodType) => {
  if (value !== 'other') {
    form.customRepaymentMethod = ''
  }
}

const resetForm = () => {
  Object.assign(form, {
    ...initialForm,
    displayRate: initialForm.monthlyInterestRate * 100
  })
  formRef.value?.resetFields()
}

const handleCancel = () => {
  resetForm()
  dialogVisible.value = false
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    const response = await loanApi.createLoan(form)
    if (response.code === 200) {
      ElMessage.success('提交成功')
      resetForm()
      dialogVisible.value = false
      emit('submit-success')
    } else {
      ElMessage.error(response.message || '提交失败')
    }
  } catch (error: any) {
    console.error('Submit loan failed:', error)
    ElMessage.error(error.message || '提交失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 