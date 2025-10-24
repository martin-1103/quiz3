@echo off
echo Installing frontend dependencies...
cd /d "D:\Project\quiz3\frontend"
npm install

echo Installing additional UI dependencies...
npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-label @radix-ui/react-checkbox @radix-ui/react-switch @radix-ui/react-textarea @radix-ui/react-input @radix-ui/react-button @radix-ui/react-card @radix-ui/react-separator @radix-ui/react-progress @radix-ui/react-alert-dialog

echo Installing state management and forms...
npm install zustand react-hook-form @hookform/resolvers zod @types/react-dom

echo Installing icons and utils...
npm install lucide-react clsx tailwind-merge class-variance-authority date-fns

echo Frontend dependencies installation completed!
pause
