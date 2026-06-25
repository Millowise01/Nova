import { useMutation, useQuery } from '@tanstack/react-query';

import { createAddress, deleteAddress, fetchAddresses, fetchMe, fetchWishlist, toggleWishlist, updateMe } from '@/api/users';

export function useMeQuery() {
  return useQuery({ queryKey: ['users', 'me'], queryFn: fetchMe });
}

export function useAddressesQuery() {
  return useQuery({ queryKey: ['users', 'addresses'], queryFn: fetchAddresses });
}

export function useWishlistQuery() {
  return useQuery({ queryKey: ['users', 'wishlist'], queryFn: fetchWishlist });
}

export function useUpdateMeMutation() {
  return useMutation({ mutationFn: updateMe });
}

export function useCreateAddressMutation() {
  return useMutation({ mutationFn: createAddress });
}

export function useDeleteAddressMutation() {
  return useMutation({ mutationFn: deleteAddress });
}

export function useToggleWishlistMutation() {
  return useMutation({ mutationFn: toggleWishlist });
}