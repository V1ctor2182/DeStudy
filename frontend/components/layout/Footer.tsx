export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <p>&copy; 2025 DeStudy. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary-600 transition">
              Docs
            </a>
            <a href="#" className="hover:text-primary-600 transition">
              GitHub
            </a>
            <a href="#" className="hover:text-primary-600 transition">
              Discord
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
