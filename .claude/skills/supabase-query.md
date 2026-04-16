# Skill: /supabase-query

Create a new React Query hook for Supabase data fetching in the RYUZUNO project.

## Arguments

- `<table>` (required): Supabase table name (e.g., `courses`, `categories`, `profiles`)
- `--name <hookName>`: Custom hook name (defaults to `use<Table>`)
- `--filter <column=value>`: Add a filter/where clause
- `--select <columns>`: Custom select columns (default: `*`)
- `--mutation`: Also generate mutation hooks (insert/update/delete)

## Instructions

Follow the existing patterns from `src/hooks/useCart.ts` and inline queries in pages like `src/pages/Index.tsx`:

### 1. Create the hook file

Create `src/hooks/<hookName>.ts`

### 2. Query hook pattern

```tsx
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTableName = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["table-name"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("table_name")
        .select("*");
      if (error) throw error;
      return data || [];
    },
    enabled: options?.enabled,
  });
};
```

### 3. Mutation hook pattern (if --mutation)

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCreateTableName = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newItem: InsertType) => {
      const { data, error } = await supabase
        .from("table_name")
        .insert(newItem)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["table-name"] });
      toast.success("Item created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create item: " + error.message);
    },
  });
};
```

### 4. Guidelines

- Use `sonner` toast for success/error notifications (matching project pattern)
- Always invalidate related queries on mutation success
- Use TypeScript types from `@/integrations/supabase/types` when available
- Use `queryKey` that matches the table name for consistency
- Handle errors with `throw error` in queryFn
