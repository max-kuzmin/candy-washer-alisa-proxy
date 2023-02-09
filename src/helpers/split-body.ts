export function splitXFormBody(body: string) {
    return new URLSearchParams(atob(body));
}