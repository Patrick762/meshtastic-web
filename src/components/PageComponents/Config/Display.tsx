import type React from "react";
import { useEffect } from "react";

import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import { Input } from "@app/components/form/Input.js";
import { Select } from "@app/components/form/Select.js";
import { Toggle } from "@app/components/form/Toggle.js";
import { DisplayValidation } from "@app/validation/config/display.js";
import { Form } from "@components/form/Form";
import { useDevice } from "@core/providers/useDevice.js";
import { renderOptions } from "@core/utils/selectEnumOptions.js";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { Protobuf } from "@meshtastic/meshtasticjs";
import { useTranslation } from "react-i18next";

export const Display = (): JSX.Element => {
  const { config, connection } = useDevice();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    control,
  } = useForm<Protobuf.Config_DisplayConfig>({
    defaultValues: config.display,
    resolver: classValidatorResolver(DisplayValidation),
  });
  const { t, i18n } = useTranslation();

  useEffect(() => {
    reset(config.display);
  }, [reset, config.display]);

  const onSubmit = handleSubmit((data) => {
    if (connection) {
      void toast.promise(
        connection.setConfig(
          {
            payloadVariant: {
              oneofKind: "display",
              display: data,
            },
          },
          async () => {
            reset({ ...data });
            await Promise.resolve();
          }
        ),
        {
          loading: t("display.saving").toString(),
          success: t("display.saved").toString(),
          error: t("display.saveError").toString(),
        }
      );
    }
  });

  return (
    <Form
      title={t("display.title")}
      breadcrumbs={["Config", "Display"]}
      reset={() => reset(config.display)}
      dirty={isDirty}
      onSubmit={onSubmit}
    >
      <Input
        label={t("display.timeout")}
        description={t("display.timeoutDescription")}
        suffix={t("display.timeoutSuffix")}
        type="number"
        {...register("screenOnSecs", { valueAsNumber: true })}
      />
      <Input
        label={t("display.carousel")}
        description={t("display.carouselDescription")}
        suffix={t("display.carouselSuffix")}
        type="number"
        {...register("autoScreenCarouselSecs", { valueAsNumber: true })}
      />
      <Select
        label={t("display.gps")}
        description={t("display.gpsDescription")}
        {...register("gpsFormat", { valueAsNumber: true })}
      >
        {renderOptions(Protobuf.Config_DisplayConfig_GpsCoordinateFormat)}
      </Select>
      <Controller
        name="compassNorthTop"
        control={control}
        render={({ field: { value, ...rest } }) => (
          <Toggle
            label={t("display.compass")}
            description={t("display.compassDescription")}
            checked={value}
            {...rest}
          />
        )}
      />
      <Controller
        name="flipScreen"
        control={control}
        render={({ field: { value, ...rest } }) => (
          <Toggle
            label={t("display.flipScreen")}
            description={t("display.flipScreenDescription")}
            checked={value}
            {...rest}
          />
        )}
      />
      <Select
        label={t("display.units")}
        description={t("display.unitsDescription")}
        {...register("units", { valueAsNumber: true })}
      >
        {renderOptions(Protobuf.Config_DisplayConfig_DisplayUnits)}
      </Select>
    </Form>
  );
};
