'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '../ui/checkbox';

const companyDetailsSchema = z.object({
  companyType: z.enum([
    'Private Limited Company',
    'Public Limited Company',
    'One Person Company (OPC)',
    'Proprietorship Firm',
  ]),
  state: z.string().min(1, 'State is required'),
  financialYear: z.string().min(1, 'Financial Year is required'),
  industryType: z.string().min(1, 'Industry Type is required'),
  turnoverRange: z.string().min(1, 'Turnover Range is required'),
  gstRegistered: z.boolean(),
  employeeCount: z.coerce.number().min(1, 'Employee count must be at least 1'),
});

type CompanyDetailsFormValues = z.infer<typeof companyDetailsSchema>;

export function CompanyDetailsForm() {
  const form = useForm<CompanyDetailsFormValues>({
    resolver: zodResolver(companyDetailsSchema),
    defaultValues: {
      state: 'Maharashtra',
      gstRegistered: false,
      financialYear: '',
      industryType: '',
    },
  });

  function onSubmit(data: CompanyDetailsFormValues) {
    console.log(data);
    // Next step would be to use this data to dynamically determine document demand.
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company & Audit Details</CardTitle>
        <CardDescription>
          Provide company details to tailor the audit scope and document requirements.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="companyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a company type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Private Limited Company">Private Limited Company</SelectItem>
                        <SelectItem value="Public Limited Company">Public Limited Company</SelectItem>
                        <SelectItem value="One Person Company (OPC)">One Person Company (OPC)</SelectItem>
                        <SelectItem value="Proprietorship Firm">Proprietorship Firm</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="financialYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Financial Year</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2023-2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="industryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Manufacturing, IT Services" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="turnoverRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Turnover Range</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a turnover range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="< 1 Cr">Less than ₹1 Crore</SelectItem>
                        <SelectItem value="1-10 Cr">₹1 - ₹10 Crore</SelectItem>
                        <SelectItem value="10-50 Cr">₹10 - ₹50 Crore</SelectItem>
                        <SelectItem value="50-100 Cr">₹50 - ₹100 Crore</SelectItem>
                        <SelectItem value="> 100 Cr">More than ₹100 Crore</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="employeeCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Count</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 50" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="gstRegistered"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        GST Registered
                      </FormLabel>
                      <FormDescription>
                        Is the company registered under GST?
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit">Proceed to Document Ingestion</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
