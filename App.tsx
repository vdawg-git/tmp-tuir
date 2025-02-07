import {
    Box,
    Key,
    List,
    Node,
    preserveScreen,
    render,
    Text,
    TextInput,
    // useFocusManager,
    // useInput,
    useKeymap,
    useList,
    useListItem,
    useNode,
    useNodeMap,
    useTextInput,
    Viewport,
    type Color,
} from "tuir";
import { useEffect, useState } from "react";

export async function startApp() {
    preserveScreen();
    const instance = render(<App />, { patchConsole: false });
    await instance.waitUntilExit();
}

const App = () => {
    return (
        <Viewport>
            <Box borderStyle={"round"} padding={1}>
                <Runner />
            </Box>
        </Viewport>
    );
};

export type RunnerItem = {
    /** This gets displayed */
    label: string;
    /** Gets shown before the label */
    icon?: string;
    /** Must be unique */
    id: string;
    onSelect: () => void;
};

const placeholders: RunnerItem[] = Array.from({ length: 20 }, (_, index) => ({
    id: String(index),
    label: String(index),
    onSelect: () => console.log("selected", index),
}));

// Move TextInput and List into Input and RunnerList components each wrapped in a
// Node to handle nav.  This also allows for isShallowFocus to work as intended
// since before the List was always deeply focused
export function Runner() {
    const nodemap = useNodeMap([["textinput"], ["list"]], {
        // Handle navigation through child components
        navigation: "none",
    });

    return (
        <Box
            flexDirection="column"
            alignItems="flex-start"
            justifyContent="flex-start"
        >
            <Node.Box {...nodemap.register("textinput")} height={1}>
                <Input />
            </Node.Box>

            <Node.Box {...nodemap.register("list")} height={16}>
                <RunnerList />
            </Node.Box>
        </Box>
    );
}

function Input(): React.ReactNode {
    const { control } = useNode();
    const { onChange, value: _ } = useTextInput("");

    return (
        <TextInput
            onChange={onChange}
            textStyle={{ inverse: true }}
            cursorColor={"blue"}
            autoEnter
            exitKeymap={[{ key: "tab" }, { key: "down" }]}
            // When exiting insert mode, shift focus to down/next
            onExit={(_, char) => {
                // Both achieve same goal in this setup
                if (char === Key.tab) control.next();
                if (char === Key.down) control.down();
            }}
        />
    );
}

function RunnerList(): React.ReactNode {
    const node = useNode();
    const [items, setItems] = useState(placeholders);
    const [activeItem, setActiveItem] = useState<RunnerItem | undefined>();

    const {
        listView,
        items: listItems,
        setItems: setListItems,
        control,
    } = useList<readonly RunnerItem[]>([], {
        // Set navigation to none because 'vi-vertical' contains mapping for tab
        // key presses.  This means that it would be unpredictable to make an
        // event mapped to tab with vi-vertical.
        navigation: "none",
        windowSize: 16,
        unitSize: 1,
    });

    const { useEvent } = useKeymap({
        select: { key: "return" },
        next: { key: "tab" },
        down: [{ key: "down" }, { input: "j" }],
        up: [{ key: "up" }, { input: "k" }],
    });

    useEvent("select", () => {
        activeItem?.onSelect();
    });
    useEvent("up", control.prevItem);
    useEvent("down", control.nextItem);
    useEvent("next", node.control.next);

    useEffect(() => {
        setListItems(items as RunnerItem[]);
    }, [items, setListItems]);

    return (
        <List listView={listView}>
            {listItems.map((item) => (
                <RunnerListItem onFocus={setActiveItem} key={item.id} />
            ))}
        </List>
    );
}

type RunnerItemProps = {
    onFocus: (item: RunnerItem) => void;
};

function RunnerListItem({ onFocus }: RunnerItemProps): React.ReactNode {
    const {
        isFocus,
        item,
        isShallowFocus,
        onFocus: gotFocus,
    } = useListItem<RunnerItem[]>();
    const { label } = item;
    const color: Color | undefined = isShallowFocus
        ? "green"
        : isFocus
          ? "blue"
          : undefined;

    // gotFocus(() => onFocus(item));
    // This should be the same?
    gotFocus(() => item.onSelect());

    return (
        <Box minWidth={40} backgroundColor={color}>
            <Text wrap="truncate-end">{label}</Text>
        </Box>
    );
}
