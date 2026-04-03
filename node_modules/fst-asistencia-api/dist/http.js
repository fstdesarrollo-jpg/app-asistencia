import { ZodError } from 'zod';
export function notFound(_req, res) {
    res.status(404).json({ error: 'Not Found' });
}
export function errorHandler(err, _req, res, _next) {
    if (err instanceof ZodError) {
        res.status(400).json({
            error: 'ValidationError',
            issues: err.issues,
        });
        return;
    }
    if (err instanceof Error) {
        res.status(500).json({ error: 'InternalError', message: err.message });
        return;
    }
    res.status(500).json({ error: 'InternalError' });
}
