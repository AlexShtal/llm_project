# Как работает React-фронтенд

Этот frontend сделан как небольшой чат-интерфейс для backend-эндпоинта `/ai/generate`. Главные файлы:

- `src/main.tsx` запускает React-приложение.
- `src/App.tsx` хранит состояние чата и рисует интерфейс.
- `src/api.ts` отправляет запрос на backend.
- `src/styles.css` отвечает за внешний вид.

## Точка входа: `main.tsx`

```tsx
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

В `index.html` есть элемент `<div id="root"></div>`. React находит его и помещает внутрь компонент `<App />`. Компонент - это функция, которая возвращает JSX, то есть разметку, похожую на HTML.

## Основной компонент: `App.tsx`

В `App.tsx` описан тип сообщения:

```tsx
type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
};
```

Каждое сообщение имеет:

- `id` - уникальный номер для React-списка;
- `role` - кто написал сообщение;
- `text` - текст сообщения.

## Состояние через `useState`

React хранит изменяемые данные компонента в state:

```tsx
const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
const [prompt, setPrompt] = useState("");
const [error, setError] = useState("");
const [isLoading, setIsLoading] = useState(false);
```

Здесь:

- `messages` - история диалога;
- `prompt` - текст в поле ввода;
- `error` - ошибка запроса, если backend вернул проблему;
- `isLoading` - идет ли сейчас генерация.

Когда вызывается `setMessages`, `setPrompt`, `setError` или `setIsLoading`, React заново перерисовывает компонент с новыми данными.

## Отправка сообщения

Форма вызывает `handleSubmit`:

```tsx
async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  ...
}
```

`event.preventDefault()` нужен, чтобы браузер не перезагружал страницу после отправки формы.

Дальше код:

1. Берет текст из `prompt`.
2. Добавляет сообщение пользователя в `messages`.
3. Очищает поле ввода.
4. Включает `isLoading`.
5. Вызывает `generateText(text)`.
6. Добавляет ответ ассистента в `messages`.
7. Выключает `isLoading`.

Если запрос завершился ошибкой, текст ошибки попадает в `error`.

## Работа с backend: `api.ts`

Функция `generateText` делает POST-запрос:

```tsx
await fetch("/ai/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ prompt }),
});
```

Frontend отправляет JSON:

```json
{
  "prompt": "текст пользователя"
}
```

Backend должен вернуть либо строку, либо объект с одним из полей: `response`, `text`, `message`.

## Рендер списка сообщений

Сообщения выводятся через `map`:

```tsx
{messages.map((message) => (
  <article className={`message ${message.role}`} key={message.id}>
    ...
  </article>
))}
```

`key={message.id}` помогает React понимать, какой элемент списка изменился, добавился или удалился.

Класс `message.user` или `message.assistant` позволяет CSS по-разному оформлять сообщения пользователя и ассистента.

## Условный рендеринг

Некоторые элементы появляются только при выполнении условия:

```tsx
{isLoading && (...)}
{error && <p className="error-message">{error}</p>}
{messages.length === 1 && (...)}
```

Так показываются индикатор печати, сообщение об ошибке и примеры запросов для нового чата.

## Стили

`styles.css` делает интерфейс похожим на чат:

- слева темная боковая панель;
- справа область диалога;
- снизу поле ввода;
- сообщения идут вертикальной лентой;
- на мобильных экранах sidebar становится верхним блоком.

Главная идея React здесь простая: данные лежат в state, пользовательские действия меняют state, а интерфейс автоматически перерисовывается под новые данные.
