import {
	List,
	preserveScreen,
	render,
	Text,
	useList,
	useListItem,
	Viewport,
} from "tuir"

export async function startApp() {
	preserveScreen()
	const instance = render(<App />, { patchConsole: false })
	await instance.waitUntilExit()
}

type Item = { id: string; label: string }
const placeholders: readonly Item[] = Array.from(
	{ length: 5500 },
	(_, index) => ({
		id: String(index),
		label: String(index),
	}),
)

const App = () => {
	const {
		listView,
		items
	} = useList(placeholders, {
		navigation: "vi-vertical",
	})

	return (
		<Viewport>
			<List listView={listView}>
				{items.map(({id}) => (
					<ListItem key={id} />
				))}
			</List>
		</Viewport>
	)
}

const ListItem = () => {
	const { isFocus, item} = useListItem<Item[]>()

	return (
		<Text backgroundColor={isFocus ? "blue" : undefined}>{item.label}</Text>
	)
}
