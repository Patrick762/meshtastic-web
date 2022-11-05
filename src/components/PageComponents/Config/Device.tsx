import type React from "react";
import { useEffect } from "react";

import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import { Select } from "@app/components/form/Select.js";
import { Toggle } from "@app/components/form/Toggle.js";
import { DeviceValidation } from "@app/validation/config/device.js";
import { Form } from "@components/form/Form";
import { useDevice } from "@core/providers/useDevice.js";
import { renderOptions } from "@core/utils/selectEnumOptions.js";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { Protobuf } from "@meshtastic/meshtasticjs";
import { useTranslation } from "react-i18next";

export const Device = (): JSX.Element => {
  const { config, connection } = useDevice();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
    reset,
  } = useForm<DeviceValidation>({
    defaultValues: config.device,
    resolver: classValidatorResolver(DeviceValidation),
  });
  const { t, i18n } = useTranslation();

  useEffect(() => {
    reset(config.device);
  }, [reset, config.device]);

  const onSubmit = handleSubmit((data) => {
    if (connection) {
      void toast.promise(
        connection.setConfig(
          {
            payloadVariant: {
              oneofKind: "device",
              device: data,
            },
          },
          async () => {
            reset({ ...data });
            await Promise.resolve();
          }
        ),
        {
          loading: t("device.saving").toString(),
          success: t("device.saved").toString(),
          error: t("device.saveError").toString(),
        }
      );
    }
  });

  return (
    <Form
      title={t("device.title")}
      breadcrumbs={["Config", "Device"]}
      reset={() => reset(config.device)}
      dirty={isDirty}
      onSubmit={onSubmit}
    >
      <Select
        label={t("device.role")}
        description={t("device.roleDescription")}
        {...register("role", { valueAsNumber: true })}
      >
        {renderOptions(Protobuf.Config_DeviceConfig_Role)}
      </Select>
      <Controller
        name="serialEnabled"
        control={control}
        render={({ field: { value, ...rest } }) => (
          <Toggle
            label={t("device.serialEnabled")}
            description={t("device.serialEnabledDescription")}
            checked={value}
            {...rest}
          />
        )}
      />
      <Controller
        name="debugLogEnabled"
        control={control}
        render={({ field: { value, ...rest } }) => (
          <Toggle
            label={t("device.debugLogEnabled")}
            description={t("device.debugLogEnabledDescription")}
            checked={value}
            {...rest}
          />
        )}
      />
    </Form>
  );
};
