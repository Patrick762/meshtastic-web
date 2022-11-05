import type React from "react";

import { Controller, useForm, useWatch } from "react-hook-form";

import { Input } from "@app/components/form/Input.js";
import { Toggle } from "@app/components/form/Toggle.js";
import { Button } from "@components/Button.js";
import { useAppStore } from "@core/stores/appStore.js";
import { useDeviceStore } from "@core/stores/deviceStore.js";
import { subscribeAll } from "@core/subscriptions.js";
import { randId } from "@core/utils/randId.js";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { IHTTPConnection } from "@meshtastic/meshtasticjs";
import { useTranslation } from "react-i18next";

export const HTTP = (): JSX.Element => {
  const { addDevice } = useDeviceStore();
  const { setSelectedDevice } = useAppStore();
  const { register, handleSubmit, control } = useForm<{
    ip: string;
    tls: boolean;
  }>({
    defaultValues: {
      ip: "meshtastic.local",
      tls: location.protocol === "https:",
    },
  });
  const { t, i18n } = useTranslation();

  const TLSEnabled = useWatch({
    control,
    name: "tls",
    defaultValue: location.protocol === "https:",
  });

  const onSubmit = handleSubmit((data) => {
    const id = randId();
    const device = addDevice(id);
    setSelectedDevice(id);
    const connection = new IHTTPConnection(id);
    // TODO: Promise never resolves
    void connection.connect({
      address: data.ip,
      fetchInterval: 2000,
      tls: data.tls,
    });
    device.addConnection(connection);
    subscribeAll(device, connection);
  });

  return (
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    <form className="flex w-full flex-col gap-2 p-4" onSubmit={onSubmit}>
      <div className="flex h-48 flex-col gap-2">
        <Input
          label={t("ipOrHostname")}
          prefix={TLSEnabled ? "https://" : "http://"}
          placeholder="000.000.000.000 / meshtastic.local"
          {...register("ip")}
        />
        <Controller
          name="tls"
          control={control}
          render={({ field: { value, ...rest } }) => (
            <Toggle
              label={t("useTls")}
              description={t("tlsDescription")}
              disabled={location.protocol === "https:"}
              checked={value}
              {...rest}
            />
          )}
        />
      </div>
      <Button iconBefore={<PlusCircleIcon className="w-4" />} type="submit">
        {t("connect")}
      </Button>
    </form>
  );
};
