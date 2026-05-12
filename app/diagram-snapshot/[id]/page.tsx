// Snapshot-only route for the ebook pipeline.
//
// Renders one exercise-diagram component at a pinned `t` value with no
// chrome around it, so Playwright can extract the resulting <svg> element
// and persist it to disk as a static asset.
//
// Not linked from anywhere in the main app; the path is prefixed with `_`
// to keep it out of the sitemap and to signal "internal tooling only".

import type { ComponentType } from "react";
import { notFound } from "next/navigation";

import { GLUTE_ANIMS } from "@/components/diagrams/glute";
import { PRONE_ANIMS } from "@/components/diagrams/prone";
import { SUPINE_ANIMS } from "@/components/diagrams/supine";
import { TRX_ANIMS } from "@/components/diagrams/trx";
import { RACK_CORE_ANIMS } from "@/components/diagrams/rack-core";
import { ARM_BALANCE_ANIMS } from "@/components/diagrams/arm-balance";
import { YOGA_ANIMS } from "@/components/diagrams/yoga";
import { EQUIPMENT_ANIMS } from "@/components/diagrams/equipment";

const ALL_ANIMS: Record<string, ComponentType<{ t: number }>> = {
  ...RACK_CORE_ANIMS,
  ...SUPINE_ANIMS,
  ...PRONE_ANIMS,
  ...GLUTE_ANIMS,
  ...TRX_ANIMS,
  ...ARM_BALANCE_ANIMS,
  ...YOGA_ANIMS,
  ...EQUIPMENT_ANIMS,
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}

function clampT(raw: string | undefined): number {
  if (!raw) return 0.5;
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0.5;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

export default async function DiagramSnapshotPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { t: tRaw } = await searchParams;
  const t = clampT(tRaw);

  const Anim = ALL_ANIMS[id];
  if (!Anim) notFound();

  return (
    <svg
      id="diagram-snapshot"
      data-diagram-id={id}
      data-t={t}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 240"
      width="400"
      height="240"
    >
      <Anim t={t} />
    </svg>
  );
}
