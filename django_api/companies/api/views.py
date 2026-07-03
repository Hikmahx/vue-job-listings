from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from companies.models import Company, CompanyMember
from companies.api.serializers import (
    CompanySerializer,
    CompanyDetailSerializer,
    CompanyMemberSerializer,
)
from companies.api.permissions import IsCompanyFounder, IsPrimaryFounder
from accounts.models import User


class GetAllCompaniesAPI(generics.ListAPIView):
    queryset = Company.objects.all().order_by('-created_at')
    serializer_class = CompanySerializer


class GetCompanyBySlugAPI(generics.RetrieveAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanyDetailSerializer
    lookup_field = 'slug'


class GetCompanyPeopleAPI(APIView):
    def get(self, request, slug):
        company = get_object_or_404(Company, slug=slug)

        founders = company.members.filter(role="founder")
        team = company.members.filter(role="employee")

        return Response({
            "founders": CompanyMemberSerializer(founders, many=True).data,
            "team": CompanyMemberSerializer(team, many=True).data,
        })


class GetCompaniesByFounderAPI(generics.ListAPIView):
    serializer_class = CompanySerializer
    
    def get_queryset(self):
        founder_id = self.kwargs.get("founder_id")

        return Company.objects.filter(
            members__user__id=founder_id,
            members__role="founder"
        ).distinct().order_by("-created_at")


class CreateCompanyAPI(generics.CreateAPIView):
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        company = serializer.save()

        # Creator becomes OWNER founder
        CompanyMember.objects.create(
            user=self.request.user,
            company=company,
            role="founder",
            permission="owner",
            title="Founder"
        )


class UpdateCompanyAPI(generics.UpdateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    lookup_field = "slug"
    permission_classes = [permissions.IsAuthenticated, IsCompanyFounder]


class DeleteCompanyAPI(generics.DestroyAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    lookup_field = "slug"
    permission_classes = [permissions.IsAuthenticated, IsPrimaryFounder]

class AddFounderAPI(APIView):
    permission_classes = [permissions.IsAuthenticated, IsCompanyFounder]

    def post(self, request, slug):
        company = get_object_or_404(Company, slug=slug)
        self.check_object_permissions(request, company)

        user_id = request.data.get("userId")
        title = request.data.get("title", "Co-Founder")

        user = get_object_or_404(User, id=user_id)

        member, created = CompanyMember.objects.get_or_create(
            company=company,
            user=user,
            defaults={
                "role": "founder",
                "permission": "admin",
                "title": title
            }
        )

        if not created:
            return Response(
                {"error": "User already belongs to this company"},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(CompanyMemberSerializer(member).data, status=status.HTTP_201_CREATED)


class RemoveFounderAPI(APIView):
    permission_classes = [permissions.IsAuthenticated, IsPrimaryFounder]

    def delete(self, request, slug, member_id):
        company = get_object_or_404(Company, slug=slug)
        self.check_object_permissions(request, company)

        member = get_object_or_404(
            CompanyMember,
            id=member_id,
            company=company,
            role="founder"
        )

        if member.permission == "owner":
            return Response(
                {"error": "Owner cannot be removed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        member.delete()
        return Response({"message": "Founder removed"}, status=status.HTTP_200_OK)


class AddEmployeeAPI(APIView):
    permission_classes = [permissions.IsAuthenticated, IsCompanyFounder]

    def post(self, request, slug):
        company = get_object_or_404(Company, slug=slug)
        self.check_object_permissions(request, company)

        user_id = request.data.get("userId")
        title = request.data.get("title", "Team Member")

        user = get_object_or_404(User, id=user_id)

        member, created = CompanyMember.objects.get_or_create(
            company=company,
            user=user,
            defaults={
                "role": "employee",
                "permission": "member",
                "title": title
            }
        )

        if not created:
            return Response(
                {"error": "User already belongs to this company"},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(CompanyMemberSerializer(member).data, status=status.HTTP_201_CREATED)


class RemoveEmployeeAPI(APIView):
    permission_classes = [permissions.IsAuthenticated, IsCompanyFounder]

    def delete(self, request, slug, member_id):
        company = get_object_or_404(Company, slug=slug)
        self.check_object_permissions(request, company)

        member = get_object_or_404(
            CompanyMember,
            id=member_id,
            company=company,
            role="employee"
        )

        member.delete()
        return Response({"message": "Employee removed"}, status=status.HTTP_200_OK)
