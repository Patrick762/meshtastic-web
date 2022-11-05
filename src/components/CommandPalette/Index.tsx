/**
 * Contextual
 * - Reset nodedb
 * - Map commands
 * - Disconnect
 * Debug commands
 * - Re-configure
 * - clear parts of store (messages, positions, telemetry etc)
 *
 * Application
 * - Light/Dark mode
 */

import type React from "react";
import { Fragment, useEffect, useState } from "react";

import { toast } from "react-hot-toast";

import { useDevice } from "@app/core/providers/useDevice.js";
import { useAppStore } from "@app/core/stores/appStore.js";
import { Combobox, Dialog, Transition } from "@headlessui/react";
import {
  ArchiveBoxXMarkIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  BeakerIcon,
  BugAntIcon,
  Cog8ToothIcon,
  CubeTransparentIcon,
  DevicePhoneMobileIcon,
  DocumentTextIcon,
  IdentificationIcon,
  InboxIcon,
  LinkIcon,
  MapIcon,
  MoonIcon,
  PlusIcon,
  QrCodeIcon,
  Square3Stack3DIcon,
  TrashIcon,
  UsersIcon,
  WindowIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

import { GroupView } from "./GroupView.js";
import { NoResults } from "./NoResults.js";
import { PaletteTransition } from "./PaletteTransition.js";
import { SearchBox } from "./SearchBox.js";
import { SearchResult } from "./SearchResult.js";
import { useTranslation } from "react-i18next";

export interface Group {
  name: string;
  icon: (props: React.ComponentProps<"svg">) => JSX.Element;
  commands: Command[];
}
export interface Command {
  name: string;
  icon: (props: React.ComponentProps<"svg">) => JSX.Element;
  action: () => void;
}

export const CommandPalette = (): JSX.Element => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const { setQRDialogOpen, setActivePage, connection } = useDevice();
  const { setSelectedDevice, removeDevice, selectedDevice } = useAppStore();
  const { t, i18n } = useTranslation();

  const groups: Group[] = [
    {
      name: t("goto"),
      icon: LinkIcon,
      commands: [
        {
          name: t("messages"),
          icon: InboxIcon,
          action() {
            setActivePage("messages");
          },
        },
        {
          name: t("map"),
          icon: MapIcon,
          action() {
            setActivePage("map");
          },
        },
        {
          name: t("extensions"),
          icon: BeakerIcon,
          action() {
            setActivePage("extensions");
          },
        },
        {
          name: t("config"),
          icon: Cog8ToothIcon,
          action() {
            setActivePage("config");
          },
        },
        {
          name: t("channels"),
          icon: Square3Stack3DIcon,
          action() {
            setActivePage("channels");
          },
        },
        {
          name: t("peers"),
          icon: UsersIcon,
          action() {
            setActivePage("peers");
          },
        },
        {
          name: t("info"),
          icon: IdentificationIcon,
          action() {
            setActivePage("info");
          },
        },
        {
          name: t("logs"),
          icon: DocumentTextIcon,
          action() {
            setActivePage("logs");
          },
        },
      ],
    },
    {
      name: t("manage"),
      icon: DevicePhoneMobileIcon,
      commands: [
        {
          name: "[WIP] " + t("switchNode"),
          icon: ArrowsRightLeftIcon,
          action() {
            alert('This feature is not implemented');
          },
        },
        {
          name: t("connectNewNode"),
          icon: PlusIcon,
          action() {
            setSelectedDevice(0);
          },
        },
      ],
    },
    {
      name: t("contextual"),
      icon: CubeTransparentIcon,
      commands: [
        {
          name: t("qrGenerator"),
          icon: QrCodeIcon,
          action() {
            setQRDialogOpen(true);
          },
        },
        {
          name: t("resetPeers"),
          icon: TrashIcon,
          action() {
            if (connection) {
              void toast.promise(connection.resetPeers(), {
                loading: t("resetting").toString(),
                success: t("resetPeersSuccess").toString(),
                error: t("resetPeersNoResponse").toString(),
              });
            }
          },
        },
        {
          name: t("disconnect"),
          icon: XCircleIcon,
          action() {
            void connection?.disconnect();
            setSelectedDevice(0);
            removeDevice(selectedDevice ?? 0);
          },
        },
      ],
    },
    {
      name: t("debug"),
      icon: BugAntIcon,
      commands: [
        {
          name: t("reconfigure"),
          icon: ArrowPathIcon,
          action() {
            void connection?.configure();
          },
        },
        {
          name: "[WIP] " + t("clearMessages"),
          icon: ArchiveBoxXMarkIcon,
          action() {
            alert('This feature is not implemented');
          },
        },
      ],
    },
    {
      name: t("application"),
      icon: WindowIcon,
      commands: [
        {
          name: "[WIP] " + t("toggleDarkMode"),
          icon: MoonIcon,
          action() {
            alert('This feature is not implemented');
          },
        },
      ],
    },
  ];

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setOpen(true);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  const filtered =
    query === ""
      ? []
      : groups
          .map((group) => {
            return {
              ...group,
              commands: group.commands.filter((command) => {
                return `${group.name} ${command.name}`
                  .toLowerCase()
                  .includes(query.toLowerCase());
              }),
            };
          })
          .filter((group) => group.commands.length);

  return (
    <Transition.Root
      show={open}
      as={Fragment}
      afterLeave={() => setQuery("")}
      appear
    >
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <PaletteTransition>
          <Dialog.Panel className="mx-auto max-w-2xl transform divide-y divide-gray-500 divide-opacity-10 overflow-hidden rounded-xl bg-white  shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
            <Combobox<Command | string>
              onChange={(input) => {
                if (typeof input === "string") {
                  setQuery(input);
                } else if (input.action) {
                  setOpen(false);
                  input.action();
                }
              }}
            >
              <SearchBox setQuery={setQuery} />

              {query === "" || filtered.length > 0 ? (
                <Combobox.Options
                  static
                  className="max-h-80 scroll-py-2 divide-y divide-gray-500 divide-opacity-10 overflow-y-auto"
                >
                  <li className="p-2">
                    <ul className="flex flex-col gap-2 text-sm text-gray-700">
                      {filtered.map((group, index) => (
                        <SearchResult key={index} group={group} />
                      ))}
                      {query === "" &&
                        groups.map((group, index) => (
                          <GroupView key={index} group={group} />
                        ))}
                    </ul>
                  </li>
                </Combobox.Options>
              ) : (
                query !== "" && filtered.length === 0 && <NoResults />
              )}
            </Combobox>
          </Dialog.Panel>
        </PaletteTransition>
      </Dialog>
    </Transition.Root>
  );
};
