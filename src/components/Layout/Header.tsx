import { LogOut, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';


export function Header() {
  const { user, signOut } = useAuthStore();
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-gray-700">
            {t("header.welcome")}, {user?.full_name || user?.email}
          </span>
          <span className="px-2 py-1 rounded-full text-xs capitalize bg-blue-100 text-blue-800">
            {user ? (
              <span>
                {t("header.role")}: {user?.role}
              </span>
            ) : (
              <span>{t("header.disconected")}</span>
            )}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => changeLanguage("fr")}
            className="text-sm text-gray-700 hover:text-gray-900"
          >
            Français
          </button>
          <button
            onClick={() => changeLanguage("en")}
            className="text-sm text-gray-700 hover:text-gray-900"
          >
            English
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-full relative"
            aria-label={t("header.notifications")}
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <button
            onClick={() => signOut()}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <LogOut size={20} />
            <span>{t("header.signOut")}</span>
          </button>
        </div>
      </div>
    </header>
  );
}