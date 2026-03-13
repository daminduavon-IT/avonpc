import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { User, FileText, Clock, Settings } from 'lucide-react';

const MyAccount = () => (
  <div>
    <section className="bg-primary py-16">
      <div className="container-main text-center">
        <h1 className="text-3xl font-bold text-primary-foreground mb-2">My Account</h1>
        <p className="text-primary-foreground/70">Manage your profile and quotation history</p>
      </div>
    </section>

    <section className="section-padding bg-background">
      <div className="container-main max-w-4xl">
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { icon: User, title: 'Profile Information', desc: 'View and edit your personal and company details.', action: 'Edit Profile' },
            { icon: FileText, title: 'Saved Quotations', desc: 'View your saved product quotation lists.', action: 'View Saved' },
            { icon: Clock, title: 'Quote History', desc: 'Track the status of your submitted quotation requests.', action: 'View History' },
            { icon: Settings, title: 'Account Settings', desc: 'Update your password and notification preferences.', action: 'Settings' },
          ].map((item, i) => (
            <div key={i} className="bg-card border rounded-xl p-6 card-hover">
              <item.icon className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{item.desc}</p>
              <Button variant="outline" size="sm">{item.action}</Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default MyAccount;
