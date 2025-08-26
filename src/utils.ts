/**
 * Create a OSC-8 escape sequence for a terminal link
 */
export function terminalLink(url: string, text: string) {
  return `\u001b]8;;${url}\u001b\\${text}\u001b]8;;\u001b\\`;
}
