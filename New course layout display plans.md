Load course structure
---------------------
- Have to load XML, but maybe simplify to JSON rather than storing as XML?
- Eventually going to display as HTML

Mark different types of thing
-----------------------------
- HTML components
    - Links within the course
    - Forum discussion links
- Interactives - how to identify?
    - iframes
    - more than X lines/characters of javascript
    - Some specific pieces from HX-JS that actually count
      as interactive and not just widgets
- Videos
- Discussions
- Basic problems
    - Split numerical from other types
- Advanced problems
    - Split JSInput from other types
- Advanced components
    - Split poll/survey/wordcloud from the others

Display on screen
-----------------
- How to display the course?
    - Show abbreviated whole and drill down as originally planned?
        - Pro: already designed.
        - Con: Have to code some more interaction.
    - Show tiny bits composited into the whole course?
        - Pro: See whole course, make less interaction.
        - Con: Might be hard to see details, not easy to make a smooth zoom here.
    - How to show deeper hierarchy like the A/B tests, cohorting, etc?
- What to summarize?
    - Number of (smaller piece) per (bigger piece)
    - Breaking that down by component type
    - Distributions of (component) across course
