import { useLanguage } from '../context/LanguageContext.jsx';

const HawrishaH = ({ size = 28, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size * 19 / 20}
    height={size}
    viewBox="1 2 19 20"
    fill="currentColor"
    className={className}
  >
    <path d="M 4 2 h 5 v 20 H 3 a 2 2 0 0 1 -2 -2 a 2 2 0 0 1 2 -2 h 1 V 2 Z M 15 2 h 5 v 20 H 14 a 2 2 0 0 1 -2 -2 a 2 2 0 0 1 2 -2 h 1 V 2 Z M 9 10 h 6 v 3 H 9 Z" />
  </svg>
);

export default function Footer({ onViewChange }) {
  const { t } = useLanguage();
  return (
    <footer className="bg-brand-charcoal text-brand-beige py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div 
            onClick={() => onViewChange && onViewChange('home')}
            dir="ltr"
            className="flex items-center gap-1 text-white select-none mb-4 cursor-pointer hover:opacity-90"
          >
            <HawrishaH size={32} className="text-white shrink-0" />
            <div className="flex flex-col items-start leading-[0.9] text-start">
              <span className="text-[18px] font-black tracking-[0.06em] uppercase font-sans text-white">HAWRISHA</span>
              <span className="text-[8px] font-extrabold tracking-[0.35em] uppercase font-sans text-[#B2AC88] mt-1">BAZAAR</span>
            </div>
          </div>
          <p className="text-sm opacity-80">
             {t('footer.tagline')}
          </p>
        </div>
        
        <div>
          <h4 className="font-bold mb-4">{t('footer.shop')}</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li>
              <button 
                onClick={() => onViewChange && onViewChange('all_products')}
                className="hover:text-brand-rose transition-colors cursor-pointer text-start w-full border-0 bg-transparent py-0 px-0"
              >
                {t('nav.all_products')}
              </button>
            </li>
            <li>
              <button 
                onClick={() => onViewChange && onViewChange('story')}
                className="hover:text-brand-rose transition-colors cursor-pointer text-start w-full border-0 bg-transparent py-0 px-0"
              >
                {t('nav.story')}
              </button>
            </li>
            <li><a href="#" className="hover:text-brand-rose transition-colors">{t('footer.christmas_socks')}</a></li>
            <li><a href="#" className="hover:text-brand-rose transition-colors">{t('footer.packs')}</a></li>
            <li>
              <button 
                onClick={() => onViewChange && onViewChange('all_products')}
                className="hover:text-brand-rose transition-colors cursor-pointer text-start w-full border-0 bg-transparent py-0 px-0"
              >
                {t('footer.new_arrivals')}
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4">{t('footer.customer_care')}</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li>
              <button 
                onClick={() => onViewChange && onViewChange('contact')}
                className="hover:text-brand-rose transition-colors cursor-pointer text-start w-full border-0 bg-transparent py-0 px-0"
              >
                {t('footer.contact_us')}
              </button>
            </li>
            <li><a href="#" className="hover:text-brand-rose transition-colors">{t('footer.delivery_returns')}</a></li>
            <li>
              <button 
                onClick={() => onViewChange && onViewChange('contact')}
                className="hover:text-brand-rose transition-colors cursor-pointer text-start w-full border-0 bg-transparent py-0 px-0"
              >
                {t('footer.faq')}
              </button>
            </li>
            <li><a href="#" className="hover:text-brand-rose transition-colors">{t('footer.size_guide')}</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4">{t('footer.newsletter')}</h4>
          <p className="text-sm opacity-80 mb-4">{t('footer.newsletter_desc')}</p>
          <form className="flex flex-col gap-2">
            <input 
              type="email" 
              placeholder={t('footer.email_placeholder')}
              className="w-full px-4 py-2 bg-white/10 text-white placeholder:text-white/50 rounded focus:outline-none focus:ring-1 focus:ring-brand-rose border border-white/20"
            />
            <button type="submit" className="w-full px-4 py-2 bg-brand-rose text-white font-bold rounded hover:bg-brand-rose/90 transition-colors cursor-pointer">
              {t('footer.subscribe')}
            </button>
          </form>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-white/10 text-center text-sm opacity-60">
        <p>&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
      </div>
    </footer>
  );
}
