import {
	Box,
	List,
	preserveScreen,
	render,
	Text,
	TextInput,
	useFocusManager,
	useInput,
	useKeymap,
	useList,
	useListItem,
	useTextInput,
	Viewport,
	type Color,
} from "tuir"
import { useEffect, useState } from "react"

export async function startApp() {
	preserveScreen()
	const instance = render(<App />, { patchConsole: false })
	await instance.waitUntilExit()
}

const App = () => {
	return (
		<Viewport>
			<Box borderStyle={"round"} padding={1}>
				<Runner />
			</Box>
		</Viewport>
	)
}

export type RunnerItem = {
	/** This gets displayed */
	label: string
	/** Gets shown before the label */
	icon?: string
	/** Must be unique */
	id: string
	onSelect: () => void
}

const placeholders: RunnerItem[] = Array.from({ length: 20 }, (_, index) => ({
	id: String(index),
	label: String(index),
	onSelect: () => console.log("selected", index),
}))

export function Runner() {
	const [items, setItems] = useState(placeholders)
	const [activeItem, setActiveItem] = useState<RunnerItem | undefined>()
	const { focusNext } = useFocusManager()

	const {
		listView,
		items: listItems,
		setItems: setListItems,
	} = useList<readonly RunnerItem[]>([], {
		navigation: "vi-vertical",
		windowSize: 16,
		unitSize: 1,
	})

	const { onChange, value: _ } = useTextInput("")

	const { useEvent } = useKeymap({
		select: { key: "return" },
		next: { key: "tab" },
	})

	useEvent("select", () => {
		activeItem?.onSelect()
	})
	useInput((_, key) => {
		if (key.tab) {
			focusNext()
		}
	})

	useEffect(() => {
		setListItems(items as RunnerItem[])
	}, [items, setListItems])

	return (
		<Box
			flexDirection="column"
			alignItems="flex-start"
			justifyContent="flex-start"
		>
			<Box height={1}>
				<TextInput
					onChange={onChange}
					textStyle={{ inverse: true }}
					cursorColor={"blue"}
					autoEnter
					exitKeymap={[{ key: "tab" }, { key: "down" }]}
				/>
			</Box>

			<Box height={16}>
				<List listView={listView}>
					{listItems.map((item) => (
						<RunnerListItem onFocus={setActiveItem} key={item.id} />
					))}
				</List>
			</Box>
		</Box>
	)
}

type RunnerItemProps = {
	onFocus: (item: RunnerItem) => void
}

function RunnerListItem({ onFocus }: RunnerItemProps): React.ReactNode {
	const {
		isFocus,
		item,
		isShallowFocus,
		onFocus: gotFocus,
	} = useListItem<RunnerItem[]>()
	const { label } = item
	const color: Color | undefined = isShallowFocus
		? "green"
		: isFocus
			? "blue"
			: undefined

	gotFocus(() => onFocus(item))

	return (
		<Box minWidth={40} backgroundColor={color}>
			<Text wrap="truncate-end">{label}</Text>
		</Box>
	)
}
