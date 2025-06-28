
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';
import { companyService } from '@/services/admin/companyService';
import { Company, CreateCompanyData } from '@/types/admin/Company';
import { useToast } from '@/hooks/use-toast';

export const CompanyManager = () => {
  const [companies, setCompanies] = useState<Company[]>(companyService.getAll());
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<CreateCompanyData>({
    name: '',
    domain: '',
    description: '',
    userLimit: 50,
    settings: {
      allowSelfRegistration: false,
      requireApproval: true,
      domainRestriction: false,
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      domain: '',
      description: '',
      userLimit: 50,
      settings: {
        allowSelfRegistration: false,
        requireApproval: true,
        domainRestriction: false,
      }
    });
    setEditingCompany(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCompany) {
      const updated = companyService.update(editingCompany.id, formData);
      if (updated) {
        setCompanies(companyService.getAll());
        toast({
          title: "Company Updated",
          description: `${formData.name} has been updated successfully.`,
        });
      }
    } else {
      const newCompany = companyService.create(formData);
      setCompanies(companyService.getAll());
      toast({
        title: "Company Created",
        description: `${formData.name} has been created successfully.`,
      });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      domain: company.domain,
      description: company.description || '',
      userLimit: company.userLimit,
      settings: company.settings,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (company: Company) => {
    if (confirm(`Are you sure you want to delete ${company.name}?`)) {
      companyService.delete(company.id);
      setCompanies(companyService.getAll());
      toast({
        title: "Company Deleted",
        description: `${company.name} has been deleted.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="tactical-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-tactical-accent">
            <Building2 className="h-5 w-5" />
            Company Management
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-tactical-accent hover:bg-tactical-accent/90 text-tactical-bg"
                onClick={resetForm}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-tactical-surface border-tactical-border">
              <DialogHeader>
                <DialogTitle className="text-tactical-accent">
                  {editingCompany ? 'Edit Company' : 'Add New Company'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Company Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-tactical-bg border-tactical-border text-tactical-text"
                    required
                  />
                </div>
                <div>
                  <Input
                    placeholder="Domain (e.g., company.com)"
                    value={formData.domain}
                    onChange={(e) => setFormData({...formData, domain: e.target.value})}
                    className="bg-tactical-bg border-tactical-border text-tactical-text"
                    required
                  />
                </div>
                <div>
                  <Input
                    placeholder="Description (optional)"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="bg-tactical-bg border-tactical-border text-tactical-text"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="User Limit"
                    value={formData.userLimit}
                    onChange={(e) => setFormData({...formData, userLimit: parseInt(e.target.value) || 50})}
                    className="bg-tactical-bg border-tactical-border text-tactical-text"
                    min="1"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="border-tactical-border text-tactical-text hover:bg-tactical-bg"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-tactical-accent hover:bg-tactical-accent/90 text-tactical-bg"
                  >
                    {editingCompany ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-tactical-accent">Name</TableHead>
              <TableHead className="text-tactical-accent">Domain</TableHead>
              <TableHead className="text-tactical-accent">Users</TableHead>
              <TableHead className="text-tactical-accent">Limit</TableHead>
              <TableHead className="text-tactical-accent">Status</TableHead>
              <TableHead className="text-tactical-accent">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="text-tactical-text font-medium">{company.name}</TableCell>
                <TableCell className="text-tactical-text/80">{company.domain}</TableCell>
                <TableCell className="text-tactical-text/80">{company.userCount}</TableCell>
                <TableCell className="text-tactical-text/80">{company.userLimit}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-mono ${
                    company.isActive ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                  }`}>
                    {company.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(company)}
                      className="border-tactical-border text-tactical-text hover:bg-tactical-bg"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(company)}
                      className="border-red-800 text-red-400 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {companies.length === 0 && (
          <div className="text-center py-8 text-tactical-text/60">
            No companies found. Create your first company to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
