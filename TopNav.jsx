import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function TopNav({ subtitle = '', rightSlot = null }) {
	return (
		<header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-xl">
			<div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4">
				<div className="flex items-center gap-3">
					<Link to="/" className="flex items-center gap-2.5">
						<div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/25">
							<Shield className="h-4 w-4" />
						</div>
						<span className="text-base font-bold tracking-tight sm:text-lg">
							Claim<span className="text-primary">Sure</span>
						</span>
					</Link>
					{subtitle ? <span className="hidden text-sm text-muted-foreground sm:inline">{subtitle}</span> : null}
				</div>
				<div className="flex items-center gap-2">{rightSlot}</div>
			</div>
		</header>
	);
}
