import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="noissue Home">
      <span className="font-headline text-3xl font-bold text-primary">
        noissue.
      </span>
    </Link>
  );
}
