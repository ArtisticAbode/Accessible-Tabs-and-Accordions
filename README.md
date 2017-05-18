# Accessible Tabs and Accordions

Both tabs and accordions show and hide content on the screen after user initiation. When stripped down to their most basic form, each trigger element can be semantically represented by a heading followed by content relating to that heading. For this reason, the markup must begin in this way for progressive enhancement. Doing this allows the content to make the most sense when no JavaScript is available, when viewed in text only browsers (like WebbIE), and displaying all content expanded in the print stylesheet. It also lends itself to displaying expanded for large screen displays and compacting to an accordion layout for smaller screens only. This can be a better user experience for large screens.

With progressive enhancement, JavaScript is added to condense the content into its tab or accordion container. To be accessible, the accordion triggers and tabs must be keyboard friendly. It is also important to use ARIA to give screen readers more information about what content is being displayed.
