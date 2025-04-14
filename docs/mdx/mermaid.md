---
title: Mermaid Diagrams
description: Using Mermaid diagrams in your documentation
---

# Mermaid Diagrams

`opendocs` supports Mermaid diagrams, allowing you to create various types of diagrams directly in your MDX files.

## Basic Syntax

To create a Mermaid diagram, use the capitalized `Mermaid` component:

```mdx
<Mermaid>
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Troubleshoot]
</Mermaid>
```

You can also use code blocks with the mermaid language:

````mdx
```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Troubleshoot]
```
````

## Diagram Types

### Flowchart

<Mermaid>
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Troubleshoot]
    D --> B
</Mermaid>

**Code:**

```mdx
```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Troubleshoot]
    D --> B
```
```

### Sequence Diagram

```mermaid
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!
```

**Code:**

```mdx
```mermaid
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!
```
```

### Class Diagram

```mermaid
classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
        +String beakColor
        +swim()
        +quack()
    }
    class Fish{
        -int sizeInFeet
        -canEat()
    }
    class Zebra{
        +bool is_wild
        +run()
    }
```

**Code:**

```mdx
```mermaid
classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
        +String beakColor
        +swim()
        +quack()
    }
    class Fish{
        -int sizeInFeet
        -canEat()
    }
    class Zebra{
        +bool is_wild
        +run()
    }
```
```

### State Diagram

```mermaid
stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]
```

**Code:**

```mdx
```mermaid
stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]
```
```

### Entity Relationship Diagram

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses
```

**Code:**

```mdx
```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses
```
```

### Gantt Chart

```mermaid
gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section
    A task           :a1, 2014-01-01, 30d
    Another task     :after a1  , 20d
    section Another
    Task in sec      :2014-01-12  , 12d
    another task      : 24d
```

**Code:**

```mdx
```mermaid
gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section
    A task           :a1, 2014-01-01, 30d
    Another task     :after a1  , 20d
    section Another
    Task in sec      :2014-01-12  , 12d
    another task      : 24d
```
```

## Customizing Diagrams

You can customize the appearance of your diagrams using Mermaid's styling options:

```mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Option 1| C[Result 1]
    B -->|Option 2| D[Result 2]
    
    style A fill:#f9d5e5,stroke:#333,stroke-width:2px
    style B fill:#d5e5f5,stroke:#333,stroke-width:2px
    style C fill:#d5f5d5,stroke:#333,stroke-width:2px
    style D fill:#f5f5d5,stroke:#333,stroke-width:2px
```

**Code:**

```mdx
```mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Option 1| C[Result 1]
    B -->|Option 2| D[Result 2]
    
    style A fill:#f9d5e5,stroke:#333,stroke-width:2px
    style B fill:#d5e5f5,stroke:#333,stroke-width:2px
    style C fill:#d5f5d5,stroke:#333,stroke-width:2px
    style D fill:#f5f5d5,stroke:#333,stroke-width:2px
```
```

For more information on Mermaid syntax and options, visit the [Mermaid documentation](https://mermaid-js.github.io/mermaid/#/).
