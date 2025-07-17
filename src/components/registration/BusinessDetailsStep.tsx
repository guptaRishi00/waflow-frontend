
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface BusinessDetailsStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

const businessActivities = [
  'Trading', 'Consulting', 'IT Services', 'Marketing', 'Real Estate',
  'Construction', 'Import/Export', 'Manufacturing', 'E-commerce', 'Tourism'
];

const officeTypes = ['Flexi', 'Dedicated', 'Shared'];

export const BusinessDetailsStep: React.FC<BusinessDetailsStepProps> = ({ data, onUpdate }) => {
  const handleChange = (field: string, value: string) => {
    onUpdate({ [field]: value });
  };

  const handleCompanyNameChange = (index: number, value: string) => {
    const newNames = [...(data.companyNameOptions || ['', '', ''])];
    newNames[index] = value;
    onUpdate({ companyNameOptions: newNames });
  };

  const handleActivityToggle = (activity: string, checked: boolean) => {
    const currentActivities = data.businessActivity || [];
    let newActivities;
    
    if (checked) {
      if (currentActivities.length < 3) {
        newActivities = [...currentActivities, activity];
      } else {
        return; // Don't allow more than 3 selections
      }
    } else {
      newActivities = currentActivities.filter((a: string) => a !== activity);
    }
    
    onUpdate({ businessActivity: newActivities });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Company Type Preference</Label>
        <Select value={data.companyTypePreference || ''} onValueChange={(value) => handleChange('companyTypePreference', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select company type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Mainland">Mainland</SelectItem>
            <SelectItem value="Free Zone">Free Zone</SelectItem>
            <SelectItem value="Offshore">Offshore</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Business Activities (Select up to 3)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
          {businessActivities.map((activity) => (
            <div key={activity} className="flex items-center space-x-2">
              <Checkbox
                id={activity}
                checked={(data.businessActivity || []).includes(activity)}
                onCheckedChange={(checked) => handleActivityToggle(activity, checked as boolean)}
                disabled={(data.businessActivity || []).length >= 3 && !(data.businessActivity || []).includes(activity)}
              />
              <Label htmlFor={activity} className="text-sm">{activity}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <Label>Company Name Options (Enter up to 3 preferences)</Label>
        <div className="space-y-3 mt-2">
          {[0, 1, 2].map((index) => (
            <Input
              key={index}
              placeholder={`Company name option ${index + 1}`}
              value={(data.companyNameOptions || ['', '', ''])[index]}
              onChange={(e) => handleCompanyNameChange(index, e.target.value)}
            />
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Office Type</Label>
          <Select value={data.officeType || ''} onValueChange={(value) => handleChange('officeType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select office type" />
            </SelectTrigger>
            <SelectContent>
              {officeTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="quotedPrice">Quoted Price (AED)</Label>
          <Input
            id="quotedPrice"
            type="number"
            value={data.quotedPrice || ''}
            onChange={(e) => handleChange('quotedPrice', e.target.value)}
            placeholder="Enter quoted price"
          />
        </div>
      </div>
    </div>
  );
};
