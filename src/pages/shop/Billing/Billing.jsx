import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axiosClient from '../../../api/axiosClient';
import endpoints from '../../../api/endpoints';
import { useAuthStore } from '../../../store/authStore';
import {
  Plus,
  Trash2,
  Search,
  User,
  ShoppingCart,
  CreditCard,
  Receipt,
  Calculator,
  Percent,
  Download,
  Save,
  Printer,
  DollarSign,
  FileText,
  Eye,
  Package,
  PrinterIcon,
  X,
  Edit2,
  Clock,
  File,
  Image,
  FileCheck,
  FileX,
  Check,
  ArrowRight,
  Upload,
  FileTextIcon
} from 'lucide-react';

export default function BillingPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [taxRate, setTaxRate] = useState(5); // Default 5% tax
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [printSettings, setPrintSettings] = useState({
    paperSize: 'A4',
    printType: 'invoice',
    showQRCode: true,
    showWatermark: false,
    includeTerms: true,
    language: 'en',
    printImmediately: true
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      customerSearch: '',
      paymentMethod: 'cash',
      additionalDiscount: 0,
      discountType: 'fixed',
      discountPercentage: 0,
      notes: '',
      billingType: 'sale',
      terms: 'Payment due within 30 days',
      invoiceNumber: ''
    }
  });

  const searchTerm = watch('customerSearch');
  const discountType = watch('discountType');
  const discountPercentage = watch('discountPercentage');
  const additionalDiscount = watch('additionalDiscount');
  const invoiceNumber = watch('invoiceNumber');

  // Generate initial invoice number
  useEffect(() => {
    const generateInvoiceNumber = () => {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `INV-${year}${month}${random}`;
    };
    
    if (!invoiceNumber) {
      setValue('invoiceNumber', generateInvoiceNumber());
    }
  }, [setValue, invoiceNumber]);

  // Calculate totals - FIXED VERSION
  const calculateTotals = () => {
    const subtotal = products.reduce((sum, product) => {
      return sum + (Number(product.mrp) * Number(product.quantity));
    }, 0);
    
    const productDiscount = products.reduce((sum, product) => {
      return sum + (Number(product.discount) || 0);
    }, 0);
    
    // Calculate additional discount - FIXED
    let additionalDiscountAmount = Number(additionalDiscount) || 0;
    if (discountType === 'percentage' && Number(discountPercentage) > 0) {
      const discountableAmount = subtotal - productDiscount;
      additionalDiscountAmount = (discountableAmount * Number(discountPercentage)) / 100;
    }
    
    const totalDiscount = productDiscount + additionalDiscountAmount;
    const taxableAmount = Math.max(0, subtotal - totalDiscount);
    const totalTax = (taxableAmount * Number(taxRate)) / 100;
    const finalAmount = subtotal - totalDiscount + totalTax;

    return {
      subtotal,
      productDiscount,
      additionalDiscountAmount,
      totalDiscount,
      taxRate,
      totalTax,
      finalAmount,
      taxableAmount
    };
  };

  const totals = calculateTotals();

  // Search customers - FIXED VERSION
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm && searchTerm.length >= 2) {
        searchCustomers(searchTerm);
      } else {
        setCustomers([]);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const searchCustomers = async (term) => {
    setSearchLoading(true);
    try {
      const response = await axiosClient.get(endpoints.customers, {
        params: { 
          search: term,
          limit: 10
        }
      });
      
      // Handle different response structures
      let customersData = response.data;
      if (response.data && response.data.data) {
        customersData = response.data.data; // If response has data property
      } else if (Array.isArray(response)) {
        customersData = response; // If response is already an array
      }
      
      setCustomers(customersData || []);
    } catch (error) {
      console.error('Error searching customers:', error);
      // Try alternative endpoint if main one fails
      try {
        const response = await axiosClient.get(endpoints.searchCustomers, {
          params: { q: term }
        });
        setCustomers(response.data || []);
      } catch (fallbackError) {
        toast.error('Failed to search customers. Please try again.');
      }
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle product operations
  const addProduct = () => {
    const newProduct = {
      name: `Product ${products.length + 1}`,
      description: '',
      code: '',
      mrp: 0,
      quantity: 1,
      discount: 0,
      taxRate: taxRate,
      taxAmount: 0,
      total: 0
    };
    setProducts([...products, newProduct]);
  };

  const addSampleProducts = () => {
    const sampleProducts = [
      {
        name: 'Frame - Titanium',
        description: 'Premium titanium frame',
        code: 'FRAME-TIT-001',
        mrp: 200,
        quantity: 1,
        discount: 0,
        taxRate: taxRate,
        taxAmount: 0,
        total: 200
      },
      {
        name: 'Lens - Progressive',
        description: 'Anti-glare progressive lens',
        code: 'LENS-PRO-001',
        mrp: 430,
        quantity: 1,
        discount: 0,
        taxRate: taxRate,
        taxAmount: 0,
        total: 430
      },
      {
        name: 'Contact Lenses',
        description: 'Monthly disposable contacts',
        code: 'CONT-MON-001',
        mrp: 100,
        quantity: 2,
        discount: 0,
        taxRate: taxRate,
        taxAmount: 0,
        total: 200
      }
    ];
    setProducts(sampleProducts);
  };

  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index, field, value) => {
    setProducts(products.map((product, i) => {
      if (i === index) {
        const updated = { ...product, [field]: field === 'name' || field === 'description' || field === 'code' ? value : parseFloat(value) || 0 };
        
        // Recalculate total when relevant fields change
        if (['mrp', 'quantity', 'discount', 'taxRate'].includes(field)) {
          const subtotal = Number(updated.mrp) * Number(updated.quantity);
          const discountAmount = Number(updated.discount) || 0;
          const netAmount = subtotal - discountAmount;
          updated.taxAmount = (netAmount * Number(updated.taxRate)) / 100;
          updated.total = netAmount + updated.taxAmount;
        }
        
        return updated;
      }
      return product;
    }));
  };

  // Handle billing submission
  const onSubmit = async (data) => {
    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }

    if (products.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    setLoading(true);
    try {
      const billingData = {
        customer: selectedCustomer._id,
        invoiceNumber: data.invoiceNumber || `INV-${Date.now()}`,
        invoiceDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        products: products.map(product => ({
          name: product.name,
          description: product.description,
          code: product.code,
          mrp: Number(product.mrp),
          quantity: Number(product.quantity),
          discount: Number(product.discount) || 0,
          taxRate: Number(product.taxRate),
          taxAmount: Number(product.taxAmount) || 0,
          total: Number(product.total)
        })),
        additionalDiscount: Number(totals.additionalDiscountAmount) || 0,
        discountType: data.discountType,
        discountPercentage: data.discountType === 'percentage' ? Number(data.discountPercentage) : 0,
        payment: {
          method: data.paymentMethod,
          amount: Number(totals.finalAmount),
          status: 'pending'
        },
        billingType: data.billingType,
        notes: data.notes,
        terms: data.terms,
        status: 'draft'
      };

      const response = await axiosClient.post(endpoints.billing, billingData);
      
      const createdBill = response.data?.data;
      
      toast.success('Bill created successfully!');
      
      // Generate PDF if option is selected
      if (printSettings.printImmediately && createdBill?._id) {
        await handleGenerateAndPrint(createdBill._id);
      }
      
      // Reset form
      reset({
        customerSearch: '',
        paymentMethod: 'cash',
        additionalDiscount: 0,
        discountType: 'fixed',
        discountPercentage: 0,
        notes: '',
        billingType: 'sale',
        terms: 'Payment due within 30 days'
      });
      setProducts([]);
      setSelectedCustomer(null);
      
      // Generate new invoice number
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setValue('invoiceNumber', `INV-${year}${month}${random}`);
      
    } catch (error) {
      console.error('Error creating bill:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create bill';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAndPrint = async (billId) => {
    try {
      toast.loading('Generating PDF...', { id: 'pdf-generate' });
      
      // First generate PDF
      await axiosClient.post(endpoints.generateBillPDF(billId));
      
      // Then download it
      const response = await axiosClient.get(endpoints.printBill(billId), {
        responseType: 'blob',
        params: {
          type: printSettings.printType,
          download: true
        }
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Open PDF in new tab for printing
      const printWindow = window.open(url);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          toast.success('PDF generated and ready for printing', { id: 'pdf-generate' });
        };
      } else {
        // If popup blocked, create download link
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice_${billId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        toast.success('PDF downloaded. Please print manually.', { id: 'pdf-generate' });
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF', { id: 'pdf-generate' });
    }
  };

  const handlePreview = async () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }

    if (products.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    // Create a temporary bill object for preview
    const previewBill = {
      invoiceNumber: invoiceNumber || `INV-${Date.now()}`,
      invoiceDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      products: products,
      subtotal: totals.subtotal,
      totalDiscount: totals.totalDiscount,
      totalTax: totals.totalTax,
      finalAmount: totals.finalAmount,
      payment: {
        method: watch('paymentMethod'),
        amount: totals.finalAmount,
        status: 'pending'
      },
      billingType: watch('billingType'),
      status: 'draft',
      customer: selectedCustomer,
      notes: watch('notes'),
      terms: watch('terms')
    };

    // Open preview in new window
    const previewHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice Preview - ${previewBill.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
          .invoice-preview { max-width: 800px; margin: 0 auto; background: white; padding: 30px; box-shadow: 0 0 20px rgba(0,0,0,0.1); border-radius: 8px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; }
          .company-name { font-size: 28px; font-weight: bold; color: #1F2937; }
          .invoice-title { font-size: 32px; color: #4F46E5; font-weight: bold; margin: 10px 0; }
          .invoice-number { font-size: 18px; color: #6B7280; }
          .section { margin: 20px 0; }
          .section-title { font-size: 18px; font-weight: bold; color: #1F2937; margin-bottom: 10px; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px; }
          .two-columns { display: flex; justify-content: space-between; gap: 40px; }
          .info-grid { display: grid; grid-template-columns: auto 1fr; gap: 8px 15px; font-size: 14px; }
          .info-label { font-weight: 600; color: #6B7280; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #4F46E5; color: white; padding: 12px; text-align: left; }
          td { padding: 12px; border-bottom: 1px solid #E5E7EB; }
          .totals { margin-top: 30px; text-align: right; }
          .total-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .grand-total { font-size: 20px; font-weight: bold; color: #4F46E5; border-top: 2px solid #E5E7EB; padding-top: 10px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center; color: #6B7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="invoice-preview">
          <div class="header">
            <div class="company-name">Eye Care Center</div>
            <div class="invoice-title">INVOICE PREVIEW</div>
            <div class="invoice-number">#${previewBill.invoiceNumber}</div>
            <div style="color: #6B7280; font-size: 14px; margin-top: 10px;">
              This is a preview. Bill will be generated when saved.
            </div>
          </div>
          
          <div class="section two-columns">
            <div>
              <div class="section-title">Bill To:</div>
              <div class="info-grid">
                <div class="info-label">Name:</div>
                <div>${previewBill.customer.name}</div>
                <div class="info-label">Phone:</div>
                <div>${previewBill.customer.phone}</div>
                ${previewBill.customer.email ? `<div class="info-label">Email:</div><div>${previewBill.customer.email}</div>` : ''}
              </div>
            </div>
            <div>
              <div class="section-title">Invoice Details:</div>
              <div class="info-grid">
                <div class="info-label">Date:</div>
                <div>${new Date(previewBill.invoiceDate).toLocaleDateString()}</div>
                <div class="info-label">Due Date:</div>
                <div>${new Date(previewBill.dueDate).toLocaleDateString()}</div>
                <div class="info-label">Payment:</div>
                <div>${previewBill.payment.method.toUpperCase()}</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Items</div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Tax</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${previewBill.products.map(product => `
                  <tr>
                    <td>${product.name}</td>
                    <td>${product.quantity}</td>
                    <td>₹${product.mrp.toFixed(2)}</td>
                    <td>₹${(product.taxAmount || 0).toFixed(2)}</td>
                    <td>₹${product.total.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>₹${previewBill.subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Discount:</span>
              <span style="color: #10B981;">- ₹${previewBill.totalDiscount.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Tax:</span>
              <span>₹${previewBill.totalTax.toFixed(2)}</span>
            </div>
            <div class="total-row grand-total">
              <span>Total Amount:</span>
              <span>₹${previewBill.finalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>This is a preview only. Please save the bill to generate official invoice.</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
            }, 1000);
          }
        </script>
      </body>
      </html>
    `;
    
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(previewHtml);
    previewWindow.document.close();
  };

  const handleSaveDraft = async () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }

    if (products.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    setLoading(true);
    try {
      const billingData = {
        customer: selectedCustomer._id,
        invoiceNumber: invoiceNumber || `INV-${Date.now()}`,
        invoiceDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        products: products.map(product => ({
          name: product.name,
          description: product.description,
          code: product.code,
          mrp: Number(product.mrp),
          quantity: Number(product.quantity),
          discount: Number(product.discount) || 0,
          taxRate: Number(product.taxRate),
          taxAmount: Number(product.taxAmount) || 0,
          total: Number(product.total)
        })),
        additionalDiscount: Number(totals.additionalDiscountAmount) || 0,
        discountType: discountType,
        discountPercentage: discountType === 'percentage' ? Number(discountPercentage) : 0,
        payment: {
          method: watch('paymentMethod'),
          amount: Number(totals.finalAmount),
          status: 'pending'
        },
        billingType: watch('billingType'),
        notes: watch('notes'),
        terms: watch('terms'),
        status: 'draft'
      };

      const response = await axiosClient.post(endpoints.billing, billingData);
      toast.success('Bill saved as draft');
      
      // Reset form but keep invoice number
      const currentInvoiceNumber = invoiceNumber;
      reset({
        customerSearch: '',
        paymentMethod: 'cash',
        additionalDiscount: 0,
        discountType: 'fixed',
        discountPercentage: 0,
        notes: '',
        billingType: 'sale',
        terms: 'Payment due within 30 days',
        invoiceNumber: currentInvoiceNumber
      });
      setProducts([]);
      setSelectedCustomer(null);
      
    } catch (error) {
      console.error('Error saving draft:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save draft';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Create New Bill
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Create invoices and manage billing for customers
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            type="button"
            onClick={handlePreview}
            disabled={!selectedCustomer || products.length === 0}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview Bill
          </button>
          <button
            type="button"
            onClick={() => setShowPrintOptions(!showPrintOptions)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FileTextIcon className="mr-2 h-4 w-4" />
            Print Options
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={loading || !selectedCustomer || products.length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </button>
        </div>
      </div>

      {/* Print Options Modal */}
      {showPrintOptions && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Print Settings</h3>
                <button
                  onClick={() => setShowPrintOptions(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paper Size
                  </label>
                  <select
                    value={printSettings.paperSize}
                    onChange={(e) => setPrintSettings({...printSettings, paperSize: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="A4">A4 (Standard)</option>
                    <option value="A5">A5 (Half)</option>
                    <option value="LETTER">Letter (US)</option>
                    <option value="LEGAL">Legal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Print Type
                  </label>
                  <select
                    value={printSettings.printType}
                    onChange={(e) => setPrintSettings({...printSettings, printType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="invoice">Full Invoice</option>
                    <option value="receipt">Payment Receipt</option>
                    <option value="simplified">Simplified Bill</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showQRCode"
                      checked={printSettings.showQRCode}
                      onChange={(e) => setPrintSettings({...printSettings, showQRCode: e.target.checked})}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="showQRCode" className="ml-2 block text-sm text-gray-700">
                      Show QR Code
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="includeTerms"
                      checked={printSettings.includeTerms}
                      onChange={(e) => setPrintSettings({...printSettings, includeTerms: e.target.checked})}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="includeTerms" className="ml-2 block text-sm text-gray-700">
                      Include Terms & Conditions
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="printImmediately"
                      checked={printSettings.printImmediately}
                      onChange={(e) => setPrintSettings({...printSettings, printImmediately: e.target.checked})}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="printImmediately" className="ml-2 block text-sm text-gray-700">
                      Print automatically after saving
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowPrintOptions(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPrintOptions(false);
                      toast.success('Print settings saved');
                    }}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer & Products */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="mr-2 h-5 w-5" />
                Customer Details
              </h3>
              <button
                type="button"
                onClick={() => setShowCustomerModal(true)}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-primary-600 hover:text-primary-900"
              >
                <Plus className="mr-1 h-4 w-4" />
                New Customer
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                {...register('invoiceNumber')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-mono bg-gray-50"
                placeholder="Invoice number"
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave blank to auto-generate or enter custom invoice number
              </p>
            </div>

            <div className="relative mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register('customerSearch')}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Search customer by name, phone, or ID..."
                />
                {searchLoading && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                  </div>
                )}
              </div>

              {/* Customer search results */}
              {searchTerm && searchTerm.length >= 2 && customers.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                  {customers.map(customer => (
                    <div
                      key={customer._id}
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setCustomers([]);
                        setValue('customerSearch', `${customer.name} (${customer.phone})`);
                      }}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                          <p className="text-xs text-gray-500">{customer.phone}</p>
                        </div>
                        <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          ID: {customer.customerId || 'N/A'}
                        </p>
                      </div>
                      {customer.email && (
                        <p className="text-xs text-gray-500 mt-1">{customer.email}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {searchTerm && searchTerm.length >= 2 && customers.length === 0 && !searchLoading && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 p-3">
                  <p className="text-sm text-gray-500">No customers found</p>
                </div>
              )}
            </div>

            {/* Selected Customer Info */}
            {selectedCustomer && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-900">{selectedCustomer.name}</h4>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCustomer(null);
                          setValue('customerSearch', '');
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-medium text-gray-600">Phone:</span>
                        <span className="ml-1 text-gray-800">{selectedCustomer.phone}</span>
                      </div>
                      {selectedCustomer.email && (
                        <div>
                          <span className="font-medium text-gray-600">Email:</span>
                          <span className="ml-1 text-gray-800">{selectedCustomer.email}</span>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-gray-600">Customer ID:</span>
                        <span className="ml-1 text-gray-800">{selectedCustomer.customerId || 'N/A'}</span>
                      </div>
                      {selectedCustomer.address?.city && (
                        <div>
                          <span className="font-medium text-gray-600">City:</span>
                          <span className="ml-1 text-gray-800">{selectedCustomer.address.city}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Products Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Products & Services
              </h3>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={addSampleProducts}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                >
                  Add Sample
                </button>
                <button
                  type="button"
                  onClick={addProduct}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Product
                </button>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No products added</p>
                <p className="text-xs text-gray-400">Click "Add Product" to start</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/12">
                        Product Details
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                        Code
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                        MRP
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                        Qty
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                        Discount
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                        Tax Rate
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                        Total
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product, index) => (
                      <tr key={index}>
                        <td className="px-3 py-3">
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={product.name}
                              onChange={(e) => updateProduct(index, 'name', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                              placeholder="Product name"
                            />
                            <input
                              type="text"
                              value={product.description}
                              onChange={(e) => updateProduct(index, 'description', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-xs"
                              placeholder="Description (optional)"
                            />
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <input
                            type="text"
                            value={product.code}
                            onChange={(e) => updateProduct(index, 'code', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-mono text-xs"
                            placeholder="Code"
                          />
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                            <input
                              type="number"
                              value={product.mrp}
                              onChange={(e) => updateProduct(index, 'mrp', e.target.value)}
                              className="w-full pl-6 pr-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <input
                            type="number"
                            value={product.quantity}
                            onChange={(e) => updateProduct(index, 'quantity', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            min="1"
                          />
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                            <input
                              type="number"
                              value={product.discount || 0}
                              onChange={(e) => updateProduct(index, 'discount', e.target.value)}
                              className="w-full pl-6 pr-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                              min="0"
                              max={product.mrp * product.quantity}
                              step="0.01"
                            />
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="relative">
                            <input
                              type="number"
                              value={product.taxRate}
                              onChange={(e) => updateProduct(index, 'taxRate', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                              min="0"
                              max="100"
                              step="0.1"
                            />
                            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                          <div className="space-y-1">
                            <div>₹{(product.total || 0).toFixed(2)}</div>
                            <div className="text-xs text-gray-500">
                              Tax: ₹{(product.taxAmount || 0).toFixed(2)}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => removeProduct(index)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Product Stats */}
            {products.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Total Items</p>
                    <p className="font-semibold">{products.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Quantity</p>
                    <p className="font-semibold">
                      {products.reduce((sum, product) => sum + (product.quantity || 0), 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Average Tax Rate</p>
                    <p className="font-semibold">
                      {products.length > 0 
                        ? (products.reduce((sum, product) => sum + (product.taxRate || 0), 0) / products.length).toFixed(1)
                        : '0'}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Additional Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bill Type
                </label>
                <select
                  {...register('billingType')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="sale">Sale</option>
                  <option value="service">Service</option>
                  <option value="prescription">Prescription</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => {
                    const newTaxRate = parseFloat(e.target.value) || 0;
                    setTaxRate(newTaxRate);
                    // Update tax rate for all products
                    setProducts(products.map(product => ({
                      ...product,
                      taxRate: newTaxRate
                    })));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  {...register('notes')}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Additional notes for the invoice..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terms & Conditions
                </label>
                <textarea
                  {...register('terms')}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Payment terms and conditions..."
                  defaultValue="Payment due within 30 days"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Payment & Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Discount Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Percent className="mr-2 h-5 w-5" />
              Discount
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Type
                </label>
                <select
                  {...register('discountType')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="fixed">Fixed Amount</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>
              {discountType === 'percentage' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Percentage
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      {...register('discountPercentage', { min: 0, max: 100 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="0-100"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Discount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      {...register('additionalDiscount', { 
                        min: 0, 
                        max: totals.taxableAmount 
                      })}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Amount"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Maximum: ₹{(totals.taxableAmount || 0).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bill Summary - FIXED VERSION */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Calculator className="mr-2 h-5 w-5" />
              Bill Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="text-sm font-medium">₹{(totals.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Product Discount:</span>
                <span className="text-sm font-medium text-green-600">- ₹{(totals.productDiscount || 0).toFixed(2)}</span>
              </div>
              {(totals.additionalDiscountAmount || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Additional Discount:</span>
                  <span className="text-sm font-medium text-green-600">- ₹{(totals.additionalDiscountAmount || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">Total Discount:</span>
                <span className="text-sm font-semibold text-green-600">- ₹{(totals.totalDiscount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tax ({totals.taxRate || 0}%):</span>
                <span className="text-sm font-medium">₹{(totals.totalTax || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="text-base font-semibold text-gray-900">Final Amount:</span>
                <span className="text-2xl font-bold text-primary-600">₹{(totals.finalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Payment Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  {...register('paymentMethod')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="insurance">Insurance</option>
                  <option value="credit">Store Credit</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount to Pay
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={totals.finalAmount || 0}
                    readOnly
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={loading || !selectedCustomer || products.length === 0}
                className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating Bill...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-5 w-5" />
                    Generate Bill & Print
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
              
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500">
                  {printSettings.printImmediately 
                    ? 'Bill will be automatically printed after generation'
                    : 'Bill will be saved and can be printed later'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setProducts([]);
                  toast.success('Products cleared');
                }}
                disabled={products.length === 0}
                className="inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </button>
              <button
                type="button"
                onClick={addSampleProducts}
                className="inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Package className="mr-2 h-4 w-4" />
                Sample Items
              </button>
              <button
                type="button"
                onClick={() => setTaxRate(0)}
                className="inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors col-span-2"
              >
                <Percent className="mr-2 h-4 w-4" />
                Remove Tax
              </button>
            </div>
          </div>

          {/* PDF Options Summary */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-primary-800 mb-2 flex items-center">
              <FileCheck className="mr-2 h-4 w-4" />
              Print Settings
            </h4>
            <div className="space-y-1 text-xs text-primary-700">
              <div className="flex justify-between">
                <span>Paper Size:</span>
                <span className="font-medium">{printSettings.paperSize}</span>
              </div>
              <div className="flex justify-between">
                <span>Print Type:</span>
                <span className="font-medium">{printSettings.printType}</span>
              </div>
              <div className="flex justify-between">
                <span>QR Code:</span>
                <span className="font-medium">{printSettings.showQRCode ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span>Auto Print:</span>
                <span className="font-medium">{printSettings.printImmediately ? 'Yes' : 'No'}</span>
              </div>
            </div>
            <button
              onClick={() => setShowPrintOptions(true)}
              className="mt-3 w-full text-xs text-primary-600 hover:text-primary-800 font-medium"
            >
              Change Settings →
            </button>
          </div>
        </div>
      </div>

      {/* New Customer Modal */}
      {showCustomerModal && (
        <NewCustomerModal 
          onClose={() => setShowCustomerModal(false)}
          onCustomerAdded={(customer) => {
            setSelectedCustomer(customer);
            setShowCustomerModal(false);
            toast.success('Customer added successfully');
          }}
        />
      )}
    </div>
  );
}

// New Customer Modal Component
function NewCustomerModal({ onClose, onCustomerAdded }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const customerData = {
        ...data,
        shop: user?.shop,
        createdBy: user._id
      };

      const response = await axiosClient.post(endpoints.customers, customerData);
      onCustomerAdded(response.data);
      reset();
    } catch (error) {
      console.error('Error adding customer:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add customer';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Add New Customer</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter customer name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                {...register('phone', { 
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: 'Please enter a valid 10-digit phone number'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter email address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  {...register('dateOfBirth')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  {...register('sex')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Customer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}