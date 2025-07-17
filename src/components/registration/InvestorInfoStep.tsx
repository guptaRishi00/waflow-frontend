
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InvestorInfoStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export const InvestorInfoStep: React.FC<InvestorInfoStepProps> = ({ data, onUpdate }) => {
  const handleChange = (field: string, value: string) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="investorName">Investor Name</Label>
          <Input
            id="investorName"
            value={data.investorName || ''}
            onChange={(e) => handleChange('investorName', e.target.value)}
            placeholder="Enter investor name"
          />
        </div>
        
        <div>
          <Label htmlFor="numberOfInvestors">Number of Investors</Label>
          <Input
            id="numberOfInvestors"
            type="number"
            value={data.numberOfInvestors || ''}
            onChange={(e) => handleChange('numberOfInvestors', e.target.value)}
            placeholder="1"
            min="1"
          />
        </div>
        
        <div>
          <Label htmlFor="investorPercentage">Investor Percentage (%)</Label>
          <Input
            id="investorPercentage"
            type="number"
            value={data.investorPercentage || ''}
            onChange={(e) => handleChange('investorPercentage', e.target.value)}
            placeholder="100"
            min="1"
            max="100"
          />
        </div>
        
        <div>
          <Label>Role</Label>
          <Select value={data.role || ''} onValueChange={(value) => handleChange('role', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Director">Director</SelectItem>
              <SelectItem value="Shareholder">Shareholder</SelectItem>
              <SelectItem value="Both">Both</SelectItem>
              <SelectItem value="Managing Director">Managing Director</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
