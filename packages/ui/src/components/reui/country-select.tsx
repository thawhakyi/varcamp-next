"use client"

import { useMemo, useState } from "react"
import { getCountries } from "react-phone-number-input"
import en from "react-phone-number-input/locale/en"
import flags from "react-phone-number-input/flags"
import type { Country } from "react-phone-number-input"
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
} from "@workspace/ui/components/combobox"
import { ScrollArea } from "@workspace/ui/components/scroll-area"

type CountrySelectProps = {
  "aria-describedby"?: string
  "aria-invalid"?: boolean
  disabled?: boolean
  value?: Country
  onChange: (country: Country) => void
  className?: string
  placeholder?: string
}

export function CountrySelect({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  disabled,
  value,
  onChange,
  className,
  placeholder = "Select country...",
}: CountrySelectProps) {
  const [searchValue, setSearchValue] = useState("")

  const countryList = useMemo(() => {
    return getCountries()
      .map((country) => ({
        value: country,
        label: en[country],
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [])

  const filteredCountries = useMemo(() => {
    if (!searchValue) return countryList
    return countryList.filter(({ label }) =>
      label.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [countryList, searchValue])

  return (
    <Combobox
      items={filteredCountries.map((country) => country.value)}
      value={value ?? null}
      onValueChange={(country) => {
        if (country) {
          onChange(country)
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
              <FlagComponent
                country={value}
                countryName={value ? en[value] : undefined}
              />
              <span className="flex-1 truncate text-left">
                {value ? en[value] : placeholder}
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
          placeholder="Search country..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          showTrigger={false}
          className="rounded-none border-0 border-input px-3 py-2.5 shadow-none ring-0! outline-none! focus-visible:border-border focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <ComboboxSeparator />
        <ComboboxEmpty className="px-4 py-2.5 text-sm">
          No country found.
        </ComboboxEmpty>
        <ComboboxList>
          <div className="relative flex max-h-full">
            <div className="flex max-h-[min(var(--available-height),24rem)] w-full scroll-pt-2 scroll-pb-2 flex-col overscroll-contain">
              <ScrollArea className="size-full min-h-0 **:data-[slot=scroll-area-scrollbar]:m-0 [&_[data-slot=scroll-area-viewport]]:h-full [&_[data-slot=scroll-area-viewport]]:overscroll-contain">
                {filteredCountries.map((item) => (
                  <ComboboxItem
                    key={item.value}
                    value={item.value}
                    className="flex items-center gap-2 px-2"
                  >
                    <FlagComponent
                      country={item.value}
                      countryName={item.label}
                    />
                    <span className="flex-1 truncate text-sm">
                      {item.label}
                    </span>
                  </ComboboxItem>
                ))}
              </ScrollArea>
            </div>
          </div>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

function FlagComponent({
  country,
  countryName,
}: {
  country?: Country
  countryName?: string
}) {
  const Flag = country ? flags[country] : undefined

  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center [&_svg:not([class*='size-'])]:size-full! [&_svg:not([class*='size-'])]:rounded-[5px]">
      {Flag ? (
        <Flag title={countryName ?? country ?? "Country flag"} />
      ) : (
        <GlobeIcon className="size-4 opacity-60" />
      )}
    </span>
  )
}
