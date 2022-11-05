import type React from "react";
import { useEffect } from "react";

import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "react-hot-toast";

import { FormSection } from "@app/components/form/FormSection.js";
import { Input } from "@app/components/form/Input.js";
import { Select } from "@app/components/form/Select.js";
import { Toggle } from "@app/components/form/Toggle.js";
import { LoRaValidation } from "@app/validation/config/lora.js";
import { Form } from "@components/form/Form";
import { useDevice } from "@core/providers/useDevice.js";
import { renderOptions } from "@core/utils/selectEnumOptions.js";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { Protobuf } from "@meshtastic/meshtasticjs";
import { useTranslation } from "react-i18next";

export const LoRa = (): JSX.Element => {
  const { config, connection } = useDevice();
  const { t, i18n } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
    reset,
  } = useForm<LoRaValidation>({
    defaultValues: config.lora,
    resolver: classValidatorResolver(LoRaValidation),
  });

  const usePreset = useWatch({
    control,
    name: "usePreset",
    defaultValue: true,
  });

  useEffect(() => {
    reset(config.lora);
  }, [reset, config.lora]);

  const onSubmit = handleSubmit((data) => {
    if (connection) {
      void toast.promise(
        connection.setConfig(
          {
            payloadVariant: {
              oneofKind: "lora",
              lora: data,
            },
          },
          async () => {
            reset({ ...data });
            await Promise.resolve();
          }
        ),
        {
          loading: t("lora.saving").toString(),
          success: t("lora.saved").toString(),
          error: t("lora.saveError").toString(),
        }
      );
    }
  });

  return (
    <Form
      title={t("lora.title")}
      breadcrumbs={["Config", "LoRa"]}
      reset={() => reset(config.lora)}
      dirty={isDirty}
      onSubmit={onSubmit}
    >
      <FormSection title={t("lora.modem")}>
        <Controller
          name="usePreset"
          control={control}
          render={({ field: { value, ...rest } }) => (
            <Toggle
              label={t("lora.modem.usePreset")}
              description={t("lora.modem.usePresetDescription")}
              checked={value}
              {...rest}
            />
          )}
        />
        <Select
          label={t("lora.modem.preset")}
          description={t("lora.modem.presetDescription")}
          disabled={!usePreset}
          {...register("modemPreset", { valueAsNumber: true })}
        >
          {renderOptions(Protobuf.Config_LoRaConfig_ModemPreset)}
        </Select>
        <Input
          label={t("lora.modem.bandwidth")}
          description={t("lora.modem.bandwidthDescription")}
          type="number"
          suffix={t("lora.modem.bandwidthSuffix")}
          error={errors.bandwidth?.message}
          {...register("bandwidth", {
            valueAsNumber: true,
          })}
          disabled={usePreset}
        />
        <Input
          label={t("lora.modem.spreadFactor")}
          description={t("lora.modem.spreadFactorDescription")}
          type="number"
          suffix={t("lora.modem.spreadFactorSuffix")}
          error={errors.spreadFactor?.message}
          {...register("spreadFactor", {
            valueAsNumber: true,
          })}
          disabled={usePreset}
        />
        <Input
          label={t("lora.modem.codingRate")}
          description={t("lora.modem.codingRateDescription")}
          type="number"
          error={errors.codingRate?.message}
          {...register("codingRate", {
            valueAsNumber: true,
          })}
          disabled={usePreset}
        />
      </FormSection>
      <FormSection title="Radio Settings">
        <Controller
          name="txEnabled"
          control={control}
          render={({ field: { value, ...rest } }) => (
            <Toggle
              label="Transmit Enabled"
              description="Description"
              checked={value}
              {...rest}
            />
          )}
        />
        <Select
          label="Region"
          description="Sets the region for your node"
          {...register("region", { valueAsNumber: true })}
        >
          {renderOptions(Protobuf.Config_LoRaConfig_RegionCode)}
        </Select>
        <Input
          label="Transmit Power"
          description="Max transmit power in dBm"
          type="number"
          error={errors.txPower?.message}
          {...register("txPower", { valueAsNumber: true })}
        />
        <Input
          label="Channel Number"
          description="LoRa channel number"
          type="number"
          error={errors.channelNum?.message}
          {...register("channelNum", { valueAsNumber: true })}
        />
        <Input
          label="Frequency Offset"
          description="Frequency offset to correct for crystal calibration errors"
          suffix="Hz"
          type="number"
          error={errors.frequencyOffset?.message}
          {...register("frequencyOffset", { valueAsNumber: true })}
        />
      </FormSection>
      <Input
        label="Hop Limit"
        description="Maximum number of hops"
        suffix="Hops"
        type="number"
        error={errors.hopLimit?.message}
        {...register("hopLimit", { valueAsNumber: true })}
      />
    </Form>
  );
};
