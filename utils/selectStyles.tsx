export const selectClassNames = {
    control: ({ isFocused }: any) =>
        `h-10 min-h-0 flex w-full rounded-md border border-input bg-muted/50 px-3 text-sm 
     ${isFocused ? "ring-3 ring-ring/50" : ""}`,

    menu: () =>
        "mt-1 rounded-md border border-input bg-popover shadow-md",

    option: ({ isFocused, isSelected }: any) =>
        `px-3 py-2 text-sm cursor-pointer rounded-sm ${isSelected
            ? "bg-primary text-primary-foreground"
            : isFocused
                ? "bg-accent text-accent-foreground"
                : ""
        }`,

    singleValue: () => "text-foreground",
    placeholder: () => "text-muted-foreground",
    input: () => "text-foreground",
    dropdownIndicator: () => "text-muted-foreground",
}

export const selectStyles = {
    menuPortal: (base: any) => ({
        ...base,
        zIndex: 9999,
        pointerEvents: "auto",
    }),
}