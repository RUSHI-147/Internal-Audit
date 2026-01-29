export type DocumentRequirement = {
  name: string;
  description: string;
  format: string;
  isMandatory: boolean;
  keywords: string[];
};

export type CompanyType =
  | 'Private Limited Company'
  | 'Public Limited Company'
  | 'One Person Company (OPC)'
  | 'Proprietorship Firm';

export const documentRequirements: Record<string, DocumentRequirement[]> = {
  'Private Limited Company': [
    { name: 'Certificate of Incorporation', description: 'Proof of company registration with the Registrar of Companies (ROC).', format: 'PDF', isMandatory: true, keywords: ['incorporation', 'coi'] },
    { name: 'MOA & AOA', description: 'Memorandum and Articles of Association outlining company objectives and rules.', format: 'PDF', isMandatory: true, keywords: ['moa', 'aoa', 'memorandum', 'articles'] },
    { name: 'Shareholding Pattern', description: 'Latest list of shareholders and their holdings (e.g., Form MGT-7).', format: 'Excel', isMandatory: true, keywords: ['shareholding', 'mgt-7', 'mgt7'] },
    { name: 'Board Meeting Minutes', description: 'Minutes of all board meetings held during the financial year.', format: 'PDF', isMandatory: true, keywords: ['minutes', 'board meeting'] },
    { name: 'General Ledger', description: 'Complete record of all financial transactions.', format: 'Excel', isMandatory: true, keywords: ['ledger', 'gl'] },
    { name: 'Trial Balance', description: 'Final trial balance as of the financial year-end.', format: 'Excel', isMandatory: true, keywords: ['trial balance'] },
    { name: 'Bank Statements', description: 'Statements for all company bank accounts for the full financial year.', format: 'PDF/CSV', isMandatory: true, keywords: ['bank statement'] },
    { name: 'GST Returns (GSTR-1, GSTR-3B)', description: 'Monthly/Quarterly GST filings.', format: 'PDF', isMandatory: true, keywords: ['gst', 'gstr'] },
    { name: 'Income Tax Return', description: 'Filed ITR acknowledgment and computation.', format: 'PDF', isMandatory: true, keywords: ['income tax', 'itr'] },
    { name: 'Statutory Registers', description: 'Registers as per Companies Act, 2013 (e.g., Register of Members, Directors).', format: 'PDF', isMandatory: true, keywords: ['statutory register'] },
  ],
  'Public Limited Company': [
    { name: 'Certificate of Incorporation', description: 'Proof of company registration with the Registrar of Companies (ROC).', format: 'PDF', isMandatory: true, keywords: ['incorporation', 'coi'] },
    { name: 'MOA & AOA', description: 'Memorandum and Articles of Association outlining company objectives and rules.', format: 'PDF', isMandatory: true, keywords: ['moa', 'aoa', 'memorandum', 'articles'] },
    { name: 'Shareholding Pattern', description: 'Latest list of shareholders and their holdings (e.g., Form MGT-7).', format: 'Excel', isMandatory: true, keywords: ['shareholding', 'mgt-7', 'mgt7'] },
    { name: 'Board Meeting Minutes', description: 'Minutes of all board meetings held during the financial year.', format: 'PDF', isMandatory: true, keywords: ['minutes', 'board meeting'] },
    { name: 'General Ledger', description: 'Complete record of all financial transactions.', format: 'Excel', isMandatory: true, keywords: ['ledger', 'gl'] },
    { name: 'Trial Balance', description: 'Final trial balance as of the financial year-end.', format: 'Excel', isMandatory: true, keywords: ['trial balance'] },
    { name: 'Bank Statements', description: 'Statements for all company bank accounts for the full financial year.', format: 'PDF/CSV', isMandatory: true, keywords: ['bank statement'] },
    { name: 'GST Returns (GSTR-1, GSTR-3B)', description: 'Monthly/Quarterly GST filings.', format: 'PDF', isMandatory: true, keywords: ['gst', 'gstr'] },
    { name: 'Income Tax Return', description: 'Filed ITR acknowledgment and computation.', format: 'PDF', isMandatory: true, keywords: ['income tax', 'itr'] },
    { name: 'Statutory Registers', description: 'Registers as per Companies Act, 2013 (e.g., Register of Members, Directors).', format: 'PDF', isMandatory: true, keywords: ['statutory register'] },
    { name: 'Auditor Appointment (ADT-1)', description: 'Form for intimating appointment of auditor to ROC.', format: 'PDF', isMandatory: true, keywords: ['adt-1', 'auditor appointment', 'adt1'] },
    { name: 'Internal Audit Reports', description: 'Internal audit reports for the period under review.', format: 'PDF', isMandatory: true, keywords: ['internal audit'] },
    { name: 'SEBI Compliances', description: 'Filings and disclosures as per SEBI regulations (if listed).', format: 'PDF', isMandatory: false, keywords: ['sebi'] },
    { name: 'Cost Audit Reports', description: 'Applicable cost audit reports.', format: 'PDF', isMandatory: false, keywords: ['cost audit'] },
    { name: 'CSR Reports', description: 'Corporate Social Responsibility reports and committee minutes (if applicable).', format: 'PDF', isMandatory: false, keywords: ['csr'] },
  ],
  'One Person Company (OPC)': [
    { name: 'Certificate of Incorporation', description: 'Proof of company registration with the ROC.', format: 'PDF', isMandatory: true, keywords: ['incorporation', 'coi'] },
    { name: 'Nominee Details', description: 'Details of the nominee director (Form INC-3).', format: 'PDF', isMandatory: true, keywords: ['nominee', 'inc-3', 'inc3'] },
    { name: 'Financial Statements', description: 'Signed Balance Sheet, P&L, and notes to accounts.', format: 'PDF', isMandatory: true, keywords: ['financial statement', 'balance sheet', 'p&l'] },
    { name: 'Bank Statements', description: 'Statements for the company bank account for the full financial year.', format: 'PDF/CSV', isMandatory: true, keywords: ['bank statement'] },
    { name: 'Income Tax Return (ITR)', description: 'Filed ITR acknowledgment and computation.', format: 'PDF', isMandatory: true, keywords: ['income tax', 'itr'] },
    { name: 'GST Returns', description: 'GSTR-1, GSTR-3B if registered under GST.', format: 'PDF', isMandatory: false, keywords: ['gst', 'gstr'] },
  ],
  'Proprietorship Firm': [
    { name: 'PAN of Proprietor', description: 'Permanent Account Number card of the proprietor.', format: 'PDF', isMandatory: true, keywords: ['pan'] },
    { name: 'Business Bank Statements', description: 'Statements for all business-related bank accounts.', format: 'PDF/CSV', isMandatory: true, keywords: ['bank statement'] },
    { name: 'Cash Book', description: 'Record of all cash transactions.', format: 'Excel', isMandatory: true, keywords: ['cash book'] },
    { name: 'Sales & Purchase Register', description: 'Detailed register of all sales and purchases.', format: 'Excel', isMandatory: true, keywords: ['sales register', 'purchase register'] },
    { name: 'Income Tax Return', description: 'Filed ITR acknowledgment and computation.', format: 'PDF', isMandatory: true, keywords: ['income tax', 'itr'] },
    { name: 'GST Returns', description: 'GSTR-1, GSTR-3B if registered under GST.', format: 'PDF', isMandatory: false, keywords: ['gst', 'gstr'] },
  ],
};
