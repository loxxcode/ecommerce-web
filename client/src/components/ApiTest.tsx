import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { productsAPI, categoriesAPI } from '@/services/api';

const ApiTest = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setLoading(true);
    try {
      // Test categories endpoint
      const categoriesData = await categoriesAPI.getAll();
      setCategories(categoriesData.categories || []);
      console.log('Categories:', categoriesData);

      // Test products endpoint
      const productsData = await productsAPI.getAll();
      setProducts(productsData.products || []);
      console.log('Products:', productsData);

      toast.success('API connection successful!');
    } catch (error) {
      console.error('API Test Error:', error);
      toast.error('API connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>API Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={testConnection} disabled={loading} className="w-full">
              {loading ? 'Testing...' : 'Test API Connection'}
            </Button>
            
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Backend Status</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Server: http://localhost:5000</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 ${categories.length > 0 ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></div>
                  <span>Categories API: {categories.length > 0 ? 'Connected' : 'No Data'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 ${products.length > 0 ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></div>
                  <span>Products API: {products.length > 0 ? 'Connected' : 'No Data'}</span>
                </div>
              </div>
            </div>

            {categories.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Categories ({categories.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {categories.slice(0, 8).map((category: any) => (
                    <div key={category._id} className="p-2 border rounded text-sm">
                      {category.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {products.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Products ({products.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.slice(0, 6).map((product: any) => (
                    <div key={product._id} className="border rounded-lg p-4">
                      <h5 className="font-medium">{product.name}</h5>
                      <p className="text-sm text-gray-600">${product.price}</p>
                      <p className="text-xs text-gray-500">{product.category?.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiTest;
