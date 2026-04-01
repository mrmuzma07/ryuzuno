import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useCart = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("cart_items")
        .select("*, courses(*, categories(name)), coupons(*)")
        .eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const addToCart = useMutation({
    mutationFn: async ({ courseId, couponId }: { courseId: string; couponId?: string }) => {
      if (!user) throw new Error("Login required");
      const { error } = await supabase.from("cart_items").insert({
        user_id: user.id,
        course_id: courseId,
        coupon_id: couponId || null,
      });
      if (error) {
        if (error.code === "23505") throw new Error("already_in_cart");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Ditambahkan ke keranjang! 🛒");
    },
    onError: (err: any) => {
      if (err.message === "already_in_cart") toast.info("Kursus sudah ada di keranjang");
      else toast.error("Gagal menambahkan ke keranjang");
    },
  });

  const removeFromCart = useMutation({
    mutationFn: async (cartItemId: string) => {
      const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Dihapus dari keranjang");
    },
  });

  const clearCart = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const updateCoupon = useMutation({
    mutationFn: async ({ cartItemId, couponId }: { cartItemId: string; couponId: string | null }) => {
      const { error } = await supabase.from("cart_items").update({ coupon_id: couponId }).eq("id", cartItemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  return { cartItems, isLoading, addToCart, removeFromCart, clearCart, updateCoupon, itemCount: cartItems.length };
};
