
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Building2, Shield } from 'lucide-react';
import { supabaseCompanyService } from '@/services/admin/supabaseCompanyService';
import { Company, CreateCompanyData } from '@/types/admin/Company';
import { useToast } from '@/hooks/use-toast';

export const SecureCompanyManager = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await supabaseCompanyService.getAll();
      setCompanies(data);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast({
        title: "Error Loading Companies",
        description: "Failed to load companies from database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCompany) {
        await supabaseCompanyService.update(editingCompany.id, formData);
        toast({
          title: "Company Updated",
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        await supabaseCompanyService.create(formData);
        toast({
          title: "Company Created",
          description: `${formData.name} has been created successfully.`,
        });
      }
      
      await loadCompanies();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving company:', error);
      toast({
        title: "Error",
        description: "Failed to save company. Please try again.",
        variant: "destructive"
      });
    }
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

  const handleDelete = async (company: Company) => {
    if (confirm(`Are you sure you want to delete ${company.name}?`)) {
      try {
        await supabaseCompanyService.delete(company.id);
        await loadCompanies();
        toast({
          title: "Company Deleted",
          description: `${company.name} has been deleted.`,
          variant: "destructive",
        });
      } catch (error) {
        console.error('Error deleting company:', error);
        toast({
          title: "Error",
          description: "Failed to delete company. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  if (loading) {
    return (
      <Card className="tactical-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tactical-accent"></div>
            <span className="ml-2 text-tactical-text font-mono">Loading companies...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="tactical-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-tactical-accent">
            <Shield className="h-5 w-5" />
            Secure Company Management
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
