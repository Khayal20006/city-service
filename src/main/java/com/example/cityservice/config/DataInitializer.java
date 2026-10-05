package com.example.cityservice.config;

import com.example.cityservice.model.Category;
import com.example.cityservice.model.User;
import com.example.cityservice.repository.CategoryRepository;
import com.example.cityservice.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Creates the first administrator account and the default category list so a fresh
 * database is immediately usable. Both steps are idempotent.
 */
@Component
@ConditionalOnProperty(prefix = "city.bootstrap", name = "enabled", havingValue = "true", matchIfMissing = true)
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private static final List<SeedCategory> DEFAULT_CATEGORIES = List.of(
            new SeedCategory("Yol və piyada piyadalar",
                    "Yol örtüyünün, bordurun və piyada piyada yolunun qüsurlu vəziyyəti",
                    "Yol-Kanalizasiya İdarəsi", "yol@city.gov.az", 120),
            new SeedCategory("Küçə işıqlandırması",
                    "Söndürülmüş və ya zəif işləyən küçə fənərləri",
                    "İşıqlandırma Şöbəsi", "isig@city.gov.az", 96),
            new SeedCategory("Zibil və çöp",
                    "Dolu konteyner, daşınmayan tullantılar və çöp yığımı problemləri",
                    "Təmizlik Mərkəzi", "temizlik@city.gov.az", 48),
            new SeedCategory("Su və kanalizasiya",
                    "Qırılan su xətti, axan kanalizasiya və təmizlənməyən drenajlar",
                    "Su-Kanalizasiya İdarəsi", "su@city.gov.az", 72),
            new SeedCategory("Park və yaşıllıqlar",
                    "Zəifləmiş yaşıllıqlar, park meşələrinin vəziyyəti və otlaq problemləri",
                    "Yaşıllıqlar və Parklar Şöbəsi", "park@city.gov.az", 168),
            new SeedCategory("Təmir və tikinti",
                    "Üzərində inşaat aparılan ərazilərdə təhlükəli vəziyyət",
                    "Əhəndiyal Xidmətləri İdarəsi", "tikinti@city.gov.az", 240),
            new SeedCategory("Təhlükəsizlik və ictimaiyyətin qorunması",
                    "İctimai yerlərdə təhlükəli vəziyyət, vandalizm və şübhəli şəxslərin qarşısının alınması",
                    "İctimai Təhlükəsizlik İdarəsi", "tehlukesizlik@city.gov.az", 48),
            new SeedCategory("Mənzil və ümumi yaşayış binaları",
                    "Ümumi evlərin lifti, üzərindəki mənzillərin və tikintinin vəziyyəti",
                    "İnzibati Yaşayış İdarəsi", "menzil@city.gov.az", 240),
            new SeedCategory("Küçə adları və ünvan nişanları",
                    "Silinmiş və ya yanlış qurulmuş küçə adları və ünvan nişanları",
                    "Coğrafiya və Ünvan Şöbəsi", "unvan@city.gov.az", 168),
            new SeedCategory("Təhsil və uşaq bağçaları",
                    "Uşaq bağçalarının, məktəblərin və yeməkxanaların vəziyyəti və təmizliyi",
                    "Təhsil İdarəsi", "tehsil@city.gov.az", 120),
            new SeedCategory("Səhiyyə və sanitariya",
                    "Fərdi sağlamlıq mərkəzləri, sanitariya və həyət yığımı problemləri",
                    "Səhiyyə İdarəsi", "səhiyyə@city.gov.az", 48),
            new SeedCategory("Heyvan və evlənmiş heyvanlar",
                    "Sahibsiz heyvanlar, evlənmiş heyvanların itkisi və aqressiv davranış",
                    "Baytar Xidməti", "baytar@city.gov.az", 72),
            new SeedCategory("Reklam qurğuları və görüntülər",
                    "İcazəsiz reklam qurğuları, bağlanmış və ya uyğun olmayan obyektlər",
                    "İnşaat və Şəhər Planlaşdırması", "reklam@city.gov.az", 96),
            new SeedCategory("Hərəkət nəzarəti və yol təhlükəsi",
                    "Təhlükəli yol kəsiyi, işıq siqnallarının nasazlığı, yol maneələri və park əngəli",
                    "Dövlət Yol Policeisinin Şəhər İdarəsi", "dyp@city.gov.az", 24),
            new SeedCategory("Torpaq və relyef problemləri",
                    "Mübahisəli torpaq sahələri, relyefin dağılması və torpaq məhsullarının həkki",
                    "Torpaq Agentliyi", "torpaq@city.gov.az", 720),
            new SeedCategory("Digər",
                    "Yuxarıdakı kateqoriyalara uyğun gəlməyən bütün digər şikayətlər",
                    "Ümumi Qəbul Şöbəsi", "qebul@city.gov.az", 72));

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final BootstrapProperties properties;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           PasswordEncoder passwordEncoder,
                           BootstrapProperties properties) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedAdmin();
        if (properties.seedCategories()) {
            seedCategories();
        }
    }

    private void seedAdmin() {
        if (userRepository.existsByRole(User.Role.ADMIN)) {
            return;
        }
        BootstrapProperties.Admin admin = properties.admin();
        User user = User.builder()
                .username(admin.username())
                .email(admin.email())
                .password(passwordEncoder.encode(admin.password()))
                .fullName("Sistem Administratoru")
                .role(User.Role.ADMIN)
                .active(true)
                .build();
        userRepository.save(user);
        log.info("Başlangıc admin hesabı yaradıldı: {}", admin.username());
    }

    private void seedCategories() {
        int created = 0;
        for (SeedCategory seed : DEFAULT_CATEGORIES) {
            if (categoryRepository.existsByNameIgnoreCase(seed.name())) {
                continue;
            }
            categoryRepository.save(Category.builder()
                    .name(seed.name())
                    .description(seed.description())
                    .departmentName(seed.departmentName())
                    .contactEmail(seed.contactEmail())
                    .estimatedResolutionHours(seed.estimatedResolutionHours())
                    .active(true)
                    .build());
            created++;
        }
        if (created > 0) {
            log.info("{} kateqoriya əlavə edildi", created);
        }
    }

    private record SeedCategory(
            String name,
            String description,
            String departmentName,
            String contactEmail,
            int estimatedResolutionHours) {
    }

    /** Bootstrap settings bound from {@code city.bootstrap.*}. */
    @ConfigurationProperties(prefix = "city.bootstrap")
    public record BootstrapProperties(Admin admin, boolean seedCategories) {

        public BootstrapProperties {
            if (seedCategories) {
                if (admin == null) {
                    throw new IllegalStateException("city.bootstrap.admin tələb olunur");
                }
                admin.validate();
            }
        }

        public record Admin(String username, String password, String email) {

            private static final String DEFAULT_USERNAME = "admin";

            public Admin {
                if (username == null || username.isBlank()) {
                    username = DEFAULT_USERNAME;
                }
                if (email == null || email.isBlank()) {
                    email = username + "@city.gov.az";
                }
                if (password == null || password.isBlank()) {
                    throw new IllegalStateException(
                            "city.bootstrap.admin.password tələb olunur (minimum 8 simvol)");
                }
            }

            void validate() {
                if (password().length() < 8) {
                    throw new IllegalStateException(
                            "Başlangıc admin parolu ən azı 8 simvol olmalıdır");
                }
            }
        }
    }
}