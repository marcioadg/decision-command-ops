
export interface Company {
  id: string;
  name: string;
  domain: string;
  description?: string;
  userLimit: number;
  isActive: boolean;
  settings: {
    allowSelfRegistration: boolean;
    requireApproval: boolean;
    domainRestriction: boolean;
  };
  createdAt: string;
  updatedAt: string;
  userCount: number;
}

export interface CreateCompanyData {
  name: string;
  domain: string;
  description?: string;
  userLimit: number;
  settings: {
    allowSelfRegistration: boolean;
    requireApproval: boolean;
    domainRestriction: boolean;
  };
}
