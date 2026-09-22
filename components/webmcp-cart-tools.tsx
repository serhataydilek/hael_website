'use client';

import { useEffect } from 'react';
import { addCartLine, readCart } from '@/lib/cart';
import { products, sizes, type Size } from '@/lib/products';

type ToolContext = {
  registerTool(
    tool: Record<string, unknown>,
    options?: { signal?: AbortSignal },
  ): void | Promise<void>;
};

export function WebMcpCartTools() {
  useEffect(() => {
    const context = (document as Document & { modelContext?: ToolContext })
      .modelContext;
    if (!context?.registerTool) return;
    const controller = new AbortController();
    const register = async () => {
      await context.registerTool(
        {
          name: 'add_product_to_bag',
          title: 'Add product to bag',
          description:
            'Add one available HAEL product and size to the local shopping bag.',
          inputSchema: {
            type: 'object',
            properties: {
              slug: { type: 'string' },
              size: { type: 'string', enum: sizes },
            },
            required: ['slug', 'size'],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute(input: unknown) {
            const value = input as { slug?: string; size?: string };
            const product = products.find((item) => item.slug === value.slug);
            if (!product || !sizes.includes(value.size as Size))
              throw new Error('Unknown product or size');
            const cart = addCartLine(product.id, value.size as Size);
            return {
              added: { productId: product.id, size: value.size, quantity: 1 },
              bagQuantity: cart.reduce((sum, line) => sum + line.quantity, 0),
            };
          },
        },
        { signal: controller.signal },
      );
      await context.registerTool(
        {
          name: 'read_bag',
          title: 'Read bag',
          description: 'Read the current HAEL shopping bag from this device.',
          inputSchema: {
            type: 'object',
            properties: {},
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true, untrustedContentHint: false },
          execute() {
            return { lines: readCart() };
          },
        },
        { signal: controller.signal },
      );
    };
    void register().catch(() => undefined);
    return () => controller.abort();
  }, []);
  return null;
}
