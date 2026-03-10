import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { showToast } from '../components/ui/toast';
import { apiClient } from '../services/api';

export const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    date_event: '',
    lieu: '',
    categorie_id: '',
    artiste_id: '',
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.titre) newErrors.titre = 'Titre requis';
    if (!formData.description) newErrors.description = 'Description requise';
    if (!formData.date_event) newErrors.date_event = 'Date requise';
    if (!formData.lieu) newErrors.lieu = 'Lieu requis';
    if (!formData.categorie_id) newErrors.categorie_id = 'Catégorie requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const eventData = {
        titre: formData.titre,
        description: formData.description,
        date_event: formData.date_event,
        lieu: formData.lieu,
        categorie_id: formData.categorie_id,
        artiste_id: formData.artiste_id || null,
      };
      await apiClient.createEvent(eventData);
      showToast('Événement créé avec succès!', 'success');
      navigate('/events');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de la création';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Créer un nouvel événement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Titre de l'événement"
                id="titre"
                name="titre"
                placeholder="Concert Jazz 2024"
                value={formData.titre}
                onChange={handleChange}
                error={errors.titre}
                disabled={loading}
              />

              <div>
                <label htmlFor="description" className="text-sm font-medium text-foreground mb-2 block">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Décrivez votre événement..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className={`
                    flex w-full rounded-md border border-input bg-background px-3 py-2
                    text-sm placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                    disabled:cursor-not-allowed disabled:opacity-50
                    ${errors.description ? 'border-destructive' : ''}
                  `}
                  disabled={loading}
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">{errors.description}</p>
                )}
              </div>

              <Input
                label="Date et heure"
                id="date_event"
                name="date_event"
                type="datetime-local"
                value={formData.date_event}
                onChange={handleChange}
                error={errors.date_event}
                disabled={loading}
              />

              <Input
                label="Lieu"
                id="lieu"
                name="lieu"
                placeholder="Paris, France"
                value={formData.lieu}
                onChange={handleChange}
                error={errors.lieu}
                disabled={loading}
              />

              <Input
                label="Catégorie ID"
                id="categorie_id"
                name="categorie_id"
                placeholder="ID de la catégorie"
                value={formData.categorie_id}
                onChange={handleChange}
                error={errors.categorie_id}
                disabled={loading}
              />

              <Input
                label="Artiste ID (optionnel)"
                id="artiste_id"
                name="artiste_id"
                placeholder="ID de l'artiste"
                value={formData.artiste_id}
                onChange={handleChange}
                disabled={loading}
              />

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/events')}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button type="submit" className="flex-1" loading={loading}>
                  Créer l'événement
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
