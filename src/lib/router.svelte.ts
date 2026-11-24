export const route = $state({ path: "/" });

const read = (): string => location.hash.slice(1) || "/";

route.path = read();
window.addEventListener("hashchange", () => {
  route.path = read();
});

export function navigate(path: string): void {
  location.hash = path;
}