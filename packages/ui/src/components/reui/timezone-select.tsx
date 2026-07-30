"use client"

import { useMemo, useState } from "react"
import { GlobeIcon } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  ComboboxGroup,
  ComboboxLabel,
} from "@workspace/ui/components/combobox"
import { ScrollArea } from "@workspace/ui/components/scroll-area"

type TimezoneSelectProps = {
  "aria-describedby"?: string
  "aria-invalid"?: boolean
  disabled?: boolean
  value?: string
  onChange: (timezone: string) => void
  className?: string
  placeholder?: string
}

export function TimezoneSelect({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  disabled,
  value,
  onChange,
  className,
  placeholder = "Select timezone...",
}: TimezoneSelectProps) {
  const [searchValue, setSearchValue] = useState("")

  const timezoneList = useMemo(() => {
    if (typeof Intl.supportedValuesOf !== "function") return []

    return Intl.supportedValuesOf("timeZone").map((tz) => {
      let offset = ""
      try {
        const formatter = new Intl.DateTimeFormat("en", {
          timeZone: tz,
          timeZoneName: "shortOffset",
        })
        const parts = formatter.formatToParts()
        offset = parts.find((p) => p.type === "timeZoneName")?.value || ""
      } catch {
        offset = ""
      }

      const parts = tz.split("/")
      const region = parts.length > 1 ? (parts[0] ?? "Other") : "Other"
      const city = parts.slice(1).join("/").replace(/_/g, " ")

      return {
        value: tz,
        label: tz.replace(/_/g, " "),
        region,
        city,
        offset,
      }
    })
  }, [])

  const filteredTimezones = useMemo(() => {
    if (!searchValue) return timezoneList
    return timezoneList.filter(
      ({ label, value }) =>
        label.toLowerCase().includes(searchValue.toLowerCase()) ||
        value.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [timezoneList, searchValue])

  const groupedTimezones = useMemo(() => {
    const groups: Record<string, typeof filteredTimezones> = {}
    for (const tz of filteredTimezones) {
      const regionTimezones = groups[tz.region] ?? []
      regionTimezones.push(tz)
      groups[tz.region] = regionTimezones
    }
    return groups
  }, [filteredTimezones])

  return (
    <Combobox
      items={filteredTimezones.map((timezone) => timezone.value)}
      value={value ?? null}
      onValueChange={(tz) => {
        if (tz) {
          onChange(tz)
        }
      }}
    >
      <ComboboxTrigger
        render={
          <Button
            aria-describedby={ariaDescribedBy}
            aria-invalid={ariaInvalid}
            variant="outline"
            className={cn(
              "flex w-full justify-between bg-transparent px-3 py-2 font-normal hover:bg-transparent focus:z-10",
              className,
              disabled && "opacity-50"
            )}
            disabled={disabled}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <GlobeIcon className="size-4 shrink-0 opacity-60" />
              <span className="flex-1 truncate text-left">
                {value ? value.replace(/_/g, " ") : placeholder}
              </span>
            </div>
            <span className="sr-only">
              <ComboboxValue />
            </span>
          </Button>
        }
      />
      <ComboboxContent className="w-[300px] p-0">
        <ComboboxInput
          placeholder="Search timezone..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          showTrigger={false}
          className="rounded-none border-0 border-input px-3 py-2.5 shadow-none ring-0! outline-none! focus-visible:border-border focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <ComboboxSeparator />
        <ComboboxEmpty className="px-4 py-2.5 text-sm">
          No timezone found.
        </ComboboxEmpty>
        <ComboboxList>
          <div className="relative flex max-h-full">
            <div className="flex max-h-[min(var(--available-height),24rem)] w-full scroll-pt-2 scroll-pb-2 flex-col overscroll-contain">
              <ScrollArea className="size-full min-h-0 **:data-[slot=scroll-area-scrollbar]:m-0 [&_[data-slot=scroll-area-viewport]]:h-full [&_[data-slot=scroll-area-viewport]]:overscroll-contain">
                {Object.entries(groupedTimezones).map(([region, tzs]) => (
                  <ComboboxGroup key={region}>
                    <ComboboxLabel className="sticky top-0 z-10 bg-popover/90 px-2 py-1.5 text-xs font-semibold text-muted-foreground backdrop-blur-sm">
                      {region}
                    </ComboboxLabel>
                    {tzs.map((item) => (
                      <ComboboxItem
                        key={item.value}
                        value={item.value}
                        className="flex items-center gap-2 px-2"
                      >
                        <span className="flex-1 truncate text-sm">
                          {item.city}
                        </span>
                        {item.offset && (
                          <span className="text-xs whitespace-nowrap text-muted-foreground">
                            {item.offset}
                          </span>
                        )}
                      </ComboboxItem>
                    ))}
                  </ComboboxGroup>
                ))}
              </ScrollArea>
            </div>
          </div>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
