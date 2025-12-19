# Markdown Example

## Headings
# H1
## H2
### H3
...

## Text Formatting
**Bold** *Italic* `Code` ~~Strikethrough~~ 
***Bold & Italic*** **_Bold & Italic (nested)_** 
~~**Bold in Strikethrough**~~ **~~Bold and Strikethrough (nested)~~**

## Blockquote
> Quote
> > Nested Quote
> > > Nested² Quote

## Lists
- Unordered
  - Nested
1. Ordered
2. Some other thing
   1. Nested Orders

- [x] Task done
- [ ] Todo italic *nested*

## Code Block
```python
print("Hello, World!")
```

## Table
| A | B |
|---|---|
| X | Y |

## Mermaid Charts

```mermaid
graph TD
    A[Start] --> B{Is Markdown beautiful?}
    B -- Yes --> C[More readable!]
    B -- No --> D[Try Mermaid diagrams]
    D --> E[Visualize ideas]
```

```mermaid
sequenceDiagram
    participant User
    participant Extension
    User->>Extension: Opens a .md file
    Extension-->>User: Renders with hidden syntax
    User->>Extension: Clicks to reveal raw markdown
    Extension-->>User: Shows raw source
```

```mermaid
gantt
    title Markdown Features Timeline
    dateFormat  YYYY-MM-DD
    section Syntax Decoration
    Bold/Italic     :done,    a1, 2023-01-01,2023-02-01
    Lists           :done,    a2, 2023-02-01,2023-03-01
    Task Lists      :active,  a3, 2023-03-01,2023-04-01
    Mermaid         :         a4, after a3, 15d
```


