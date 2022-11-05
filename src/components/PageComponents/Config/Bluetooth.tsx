import type React from "react";
import { useEffect } from "react";

import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "react-hot-toast";

import { Input } from "@app/components/form/Input.js";
import { Select } from "@app/components/form/Select.js";
import { Toggle } from "@app/components/form/Toggle.js";
import { BluetoothValidation } from "@app/validation/config/bluetooth.js";
import { Form } from "@components/form/Form";
import { useDevice } from "@core/providers/useDevice.js";
import { renderOptions } from "@core/utils/selectEnumOptions.js";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { Protobuf } from "@meshtastic/meshtasticjs";
import { useTranslation } from "react-i18next";

export const Bluetooth = (): JSX.Element => {
  const { config, connection } = useDevice();
  const { t, i18n } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
    reset,
  } = useForm<BluetoothValidation>({
    defaultValues: config.bluetooth,
    resolver: classValidatorResolver(BluetoothValidation),
  });

  useEffect(() => {
    reset(config.bluetooth);
  }, [reset, config.bluetooth]);

  const onSubmit = handleSubmit((data) => {
    if (connection) {
      void toast.promise(
        connection.setConfig(
          {
            payloadVariant: {
              oneofKind: "bluetooth",
              bluetooth: data,
            },
          },
          async () => {
            reset({ ...data });
            await Promise.resolve();
          }
        ),
        {
          loading: t("bluetooth.saving").toString(),
          success: t("bluetooth.saved").toString(),
          error: t("bluetooth.saveError").toString(),
        }
      );
    }
  });

  const pairingMode = useWatch({
    control,
    name: "mode",
    defaultValue: Protobuf.Config_BluetoothConfig_PairingMode.RANDOM_PIN,
  });

  return (
    <Form
      title={t("bluetooth.title")}
      breadcrumbs={["Config", "Bluetooth"]}
      reset={() => reset(config.bluetooth)}
      dirty={isDirty}
      onSubmit={onSubmit}
    >
      <Controller
        name="enabled"
        control={control}
        render={({ field: { value, ...rest } }) => (
          <Toggle
            label={t("bluetooth.enabled")}
            description={t("bluetooth.toggle")}
            checked={value}
            {...rest}
          />
        )}
      />
      <Select
        label={t("bluetooth.pairingMode")}
        description={t("bluetooth.pairingModeDescription")}
        {...register("mode", { valueAsNumber: true })}
      >
        {renderOptions(Protobuf.Config_BluetoothConfig_PairingMode)}
      </Select>

      <Input
        disabled={
          pairingMode !== Protobuf.Config_BluetoothConfig_PairingMode.FIXED_PIN
        }
        label={t("bluetooth.pin")}
        description={t("bluetooth.pinDescription")}
        type="number"
        {...register("fixedPin", {
          valueAsNumber: true,
        })}
      />
    </Form>
  );
};
