from rest_framework import serializers
from cold_emails.models import ColdEmailEntry, ColdEmailRecipient, ColdEmailMessage, ColdEmailFollowUp


class ColdEmailRecipientSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source='full_name', default='', allow_blank=True)
    avatar = serializers.URLField(default='', allow_blank=True, required=False)

    class Meta:
        model = ColdEmailRecipient
        fields = ['fullName', 'email', 'avatar']


class ColdEmailMessageSerializer(serializers.ModelSerializer):
    emailSent = serializers.CharField(source='email_sent', default='', allow_blank=True)

    class Meta:
        model = ColdEmailMessage
        fields = ['subject', 'date', 'read', 'response', 'emailSent']


class ColdEmailFollowUpSerializer(serializers.ModelSerializer):
    class Meta:
        model = ColdEmailFollowUp
        fields = ['date', 'read']


class ColdEmailEntrySerializer(serializers.ModelSerializer):
    roleApplyingFor = serializers.CharField(source='role_applying_for', default='', allow_blank=True)
    followUpDate = serializers.CharField(source='follow_up_date', default='', allow_blank=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    recipients = ColdEmailRecipientSerializer(many=True, required=False, default=list)
    message = ColdEmailMessageSerializer(required=False)
    followUps = ColdEmailFollowUpSerializer(source='follow_ups', many=True, required=False, default=list)

    class Meta:
        model = ColdEmailEntry
        fields = [
            'id', 'company', 'roleApplyingFor',
            'recipients', 'message', 'followUps',
            'status', 'tags', 'notes', 'followUpDate',
            'createdAt', 'updatedAt',
        ]
        read_only_fields = ['id', 'createdAt', 'updatedAt']

    def _save_recipients(self, entry, recipients_data):
        entry.recipients.all().delete()
        for r in recipients_data:
            ColdEmailRecipient.objects.create(
                entry=entry,
                full_name=r.get('full_name', r.get('fullName', '')),
                email=r.get('email', ''),
                avatar=r.get('avatar', ''),
            )

    def _save_message(self, entry, message_data):
        if not message_data:
            ColdEmailMessage.objects.get_or_create(entry=entry)
            return
        ColdEmailMessage.objects.update_or_create(
            entry=entry,
            defaults={
                'subject': message_data.get('subject', ''),
                'date': message_data.get('date', ''),
                'read': message_data.get('read', False),
                'response': message_data.get('response', False),
                'email_sent': message_data.get('email_sent', message_data.get('emailSent', '')),
            },
        )

    def _save_follow_ups(self, entry, follow_ups_data):
        entry.follow_ups.all().delete()
        for i, fu in enumerate(follow_ups_data[:4]):
            ColdEmailFollowUp.objects.create(
                entry=entry,
                date=fu.get('date', ''),
                read=fu.get('read', False),
                order=i,
            )
        # Always ensure at least one follow-up row exists
        if not entry.follow_ups.exists():
            ColdEmailFollowUp.objects.create(entry=entry, date='', read=False, order=0)

    def create(self, validated_data):
        recipients_data = validated_data.pop('recipients', [])
        message_data = validated_data.pop('message', None)
        follow_ups_data = validated_data.pop('follow_ups', [])

        # Map camelCase writes back to model fields
        if 'role_applying_for' not in validated_data and 'roleApplyingFor' in self.initial_data:
            validated_data['role_applying_for'] = self.initial_data['roleApplyingFor']
        if 'follow_up_date' not in validated_data and 'followUpDate' in self.initial_data:
            validated_data['follow_up_date'] = self.initial_data['followUpDate']

        entry = ColdEmailEntry.objects.create(**validated_data)
        self._save_recipients(entry, recipients_data)
        self._save_message(entry, message_data)
        self._save_follow_ups(entry, follow_ups_data)
        return entry

    def update(self, instance, validated_data):
        recipients_data = validated_data.pop('recipients', None)
        message_data = validated_data.pop('message', None)
        follow_ups_data = validated_data.pop('follow_ups', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if recipients_data is not None:
            self._save_recipients(instance, recipients_data)
        if message_data is not None:
            self._save_message(instance, message_data)
        if follow_ups_data is not None:
            self._save_follow_ups(instance, follow_ups_data)

        return instance
