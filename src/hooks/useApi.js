import { useState, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-hot-toast';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const callApi = useCallback(async (apiCall, successMessage = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall();
      
      if (response.success) {
        setData(response.data);
        if (successMessage) {
          toast.success(successMessage);
        }
        return response;
      } else {
        throw new Error(response.message || 'Request failed');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Something went wrong';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback(async (url, config = {}) => {
    return callApi(() => axiosClient.get(url, config));
  }, [callApi]);

  const post = useCallback(async (url, data, config = {}) => {
    return callApi(() => axiosClient.post(url, data, config));
  }, [callApi]);

  const put = useCallback(async (url, data, config = {}) => {
    return callApi(() => axiosClient.put(url, data, config));
  }, [callApi]);

  const patch = useCallback(async (url, data, config = {}) => {
    return callApi(() => axiosClient.patch(url, data, config));
  }, [callApi]);

  const del = useCallback(async (url, config = {}) => {
    return callApi(() => axiosClient.delete(url, config));
  }, [callApi]);

  return {
    loading,
    error,
    data,
    get,
    post,
    put,
    patch,
    delete: del,
    reset: () => {
      setLoading(false);
      setError(null);
      setData(null);
    },
  };
};

export const usePaginatedApi = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [items, setItems] = useState([]);
  
  const api = useApi();

  // In the usePaginatedApi function, update the fetch function:
const fetch = useCallback(async (apiCall, params = {}) => {
  try {
    console.log("Fetching data from:", apiCall);
    const response = await api.get(apiCall, { params });
    
    console.log("Paginated API response:", response);
    
    if (response && response.success === true) {
      // Your API returns data directly at response.data (array)
      const itemsArray = response.data; // This is the array
      const paginationData = response.pagination;
      
      console.log("Items array:", itemsArray);
      console.log("Pagination data:", paginationData);
      
      setItems(Array.isArray(itemsArray) ? itemsArray : []);
      setTotal(paginationData?.total || itemsArray?.length || 0);
      setPages(paginationData?.pages || 1);
      
      return response;
    } else {
      console.log("Response not successful or no success property");
      setItems([]);
      setTotal(0);
      setPages(1);
    }
    
    return response;
  } catch (error) {
    console.error("Error in fetch:", error);
    setItems([]);
    setTotal(0);
    setPages(1);
    throw error;
  }
}, [api, page, limit]);

  return {
    ...api,
    page,
    setPage,
    limit,
    setLimit,
    total,
    pages,
    items,
    setItems,
    fetch,
  };
};