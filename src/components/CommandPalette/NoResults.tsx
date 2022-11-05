import type React from "react";

import { CommandLineIcon } from "@heroicons/react/24/outline";

import { Mono } from "../Mono.js";
import { useTranslation } from "react-i18next";

export const NoResults = (): JSX.Element => {
  const { t, i18n } = useTranslation();

  return (
    <div className="py-14 px-14 text-center">
      <CommandLineIcon className="mx-auto h-6 text-slate-500" />
      <Mono className="tracking-tighter">
        {t("queryNoResults")}
      </Mono>
    </div>
  );
};
