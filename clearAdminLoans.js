import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取贷款数据文件
const loansPath = join(__dirname, 'data', 'loans.json');

try {
  // 读取现有贷款数据
  const loansData = JSON.parse(readFileSync(loansPath, 'utf8'));
  
  // 过滤掉 admin 用户的贷款
  const filteredLoans = loansData.filter(loan => loan.userId !== 'admin');
  
  // 写回文件
  writeFileSync(loansPath, JSON.stringify(filteredLoans, null, 2));
  
  console.log('成功清除 admin 用户的所有贷款记录');
} catch (error) {
  console.error('清除贷款记录失败:', error);
} 