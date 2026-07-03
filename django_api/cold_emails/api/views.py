from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from cold_emails.models import ColdEmailEntry
from cold_emails.api.serializers import ColdEmailEntrySerializer


class ColdEmailEntryListCreateAPI(generics.ListCreateAPIView):
    """
    GET  /api/cold-emails/   — list all entries for the authenticated user (sorted by updated_at desc)
    POST /api/cold-emails/   — create a new entry
    """
    serializer_class = ColdEmailEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            ColdEmailEntry.objects
            .filter(user=self.request.user)
            .prefetch_related('recipients', 'message', 'follow_ups')
            .order_by('-updated_at')
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ColdEmailEntryDetailAPI(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/cold-emails/:id/  — get one entry (must belong to user)
    PUT    /api/cold-emails/:id/  — update
    DELETE /api/cold-emails/:id/  — delete
    """
    serializer_class = ColdEmailEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            ColdEmailEntry.objects
            .filter(user=self.request.user)
            .prefetch_related('recipients', 'message', 'follow_ups')
        )

    def get_object(self):
        try:
            return self.get_queryset().get(pk=self.kwargs['pk'])
        except ColdEmailEntry.DoesNotExist:
            raise NotFound('Cold email entry not found')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({'message': 'Deleted successfully'}, status=status.HTTP_200_OK)
