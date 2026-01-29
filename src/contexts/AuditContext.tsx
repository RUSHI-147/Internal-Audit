'use client';

import { mockAnomalies } from '@/lib/data';
import { Anomaly, AuditStatus, UploadedDoc } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode } from 'react';

type AuditContextType = {
  auditStatus: AuditStatus;
  uploadedDocs: UploadedDoc[];
  findings: Anomaly[];
  startAudit: () => void;
  addUploadedDoc: (doc: UploadedDoc) => void;
  resetAudit: () => void;
};

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export const AuditProvider = ({ children }: { children: ReactNode }) => {
  const [auditStatus, setAuditStatus] = useState<AuditStatus>('CREATED');
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [findings, setFindings] = useState<Anomaly[]>([]);

  const addUploadedDoc = (doc: UploadedDoc) => {
    setUploadedDocs((prev) => [...prev, doc]);
  };

  const startAudit = () => {
    setAuditStatus('RUNNING');
    // Simulate a network call and processing time for the audit
    setTimeout(() => {
      // In a real app, this data would come from the backend API
      setFindings(mockAnomalies);
      setAuditStatus('COMPLETED');
    }, 5000); // 5-second delay to simulate audit execution
  };
  
  const resetAudit = () => {
    setAuditStatus('CREATED');
    setUploadedDocs([]);
    setFindings([]);
  }

  const value = {
    auditStatus,
    uploadedDocs,
    findings,
    startAudit,
    addUploadedDoc,
    resetAudit,
  };

  return (
    <AuditContext.Provider value={value}>{children}</AuditContext.Provider>
  );
};

export const useAudit = () => {
  const context = useContext(AuditContext);
  if (context === undefined) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
};
