import {
  IconBrandDiscord,
  IconBrandFacebook,
  IconBrandTelegram,
  IconPhone,
  IconX,
  type Icon,
} from "@tabler/icons-react"
import { motion } from "framer-motion"

import { Button } from "@workspace/ui/components/button"
import { ButtonGroup } from "@workspace/ui/components/button-group"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@workspace/ui/components/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"

import { contactChannels, type ContactChannelId } from "./volunteer-data"

const channelIcons: Record<ContactChannelId, Icon> = {
  phone: IconPhone,
  facebook: IconBrandFacebook,
  telegram: IconBrandTelegram,
  discord: IconBrandDiscord,
}

type ContactChannelProps = {
  channel: ContactChannelId | ""
  channelError?: string
  id?: string
  onChannelChange: (channel: ContactChannelId | "") => void
  onValueChange: (value: string) => void
  value: string
  valueError?: string
}

export function ContactChannel({
  channel,
  channelError,
  id = "contactValue",
  onChannelChange,
  onValueChange,
  value,
  valueError,
}: ContactChannelProps) {
  const selectedChannel = contactChannels.find(
    (contactChannel) => contactChannel.id === channel
  )
  const SelectedIcon = selectedChannel
    ? channelIcons[selectedChannel.id]
    : undefined
  const errorId = `${id}-error`
  const hasError = Boolean(channelError || valueError)

  return (
    <div
      className={cn(
        "grid min-w-0 gap-2",
        selectedChannel && "sm:grid-cols-[12rem_minmax(0,1fr)]"
      )}
    >
      <ButtonGroup className="w-full" aria-label="Contact channel selection">
        <Select
          value={channel}
          onValueChange={(nextChannel) => {
            onChannelChange(nextChannel as ContactChannelId)
            onValueChange("")
          }}
        >
          <SelectTrigger
            id="contactChannel"
            className="min-w-0 flex-1"
            aria-label="Contact channel"
            aria-invalid={Boolean(channelError)}
            aria-describedby={channelError ? errorId : undefined}
          >
            <SelectValue placeholder="Choose a channel" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectGroup>
              {contactChannels.map((contactChannel) => {
                const ChannelIcon = channelIcons[contactChannel.id]

                return (
                  <SelectItem
                    key={contactChannel.id}
                    value={contactChannel.id}
                    textValue={contactChannel.label}
                  >
                    <ChannelIcon aria-hidden="true" stroke={1.8} />
                    <span>{contactChannel.label}</span>
                  </SelectItem>
                )
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
        {selectedChannel ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Clear contact channel"
            onClick={() => {
              onChannelChange("")
              onValueChange("")
            }}
          >
            <IconX aria-hidden="true" />
          </Button>
        ) : null}
      </ButtonGroup>

      {selectedChannel && SelectedIcon && (
        <motion.div
          key={selectedChannel.id}
          initial={{ opacity: 0, x: 8, filter: "blur(3px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>
                <SelectedIcon aria-hidden="true" stroke={1.8} />
                {selectedChannel.prefix}
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id={id}
              name={id}
              inputMode={selectedChannel.inputMode}
              autoComplete={selectedChannel.id === "phone" ? "tel" : "off"}
              autoCapitalize="none"
              spellCheck={false}
              placeholder={selectedChannel.placeholder}
              value={value}
              maxLength={120}
              onChange={(event) => onValueChange(event.target.value)}
              required
              aria-label={`${selectedChannel.label} contact`}
              aria-invalid={hasError}
              aria-describedby={hasError ? errorId : undefined}
            />
          </InputGroup>
        </motion.div>
      )}
    </div>
  )
}
